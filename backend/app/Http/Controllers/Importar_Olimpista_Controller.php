<?php

namespace App\Http\Controllers;

use App\Models\Importar_Olimpista;
use App\Models\Area;
use App\Models\Nivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class Importar_Olimpista_Controller extends Controller
{
    public function importar(Request $request)
    {
        try {
            if (!$request->hasFile('file')) {
                return response()->json(['message' => 'No se encontró archivo CSV'], 400);
            }

            $file = $request->file('file');

            if ($file->getClientOriginalExtension() !== 'csv') {
                return response()->json(['message' => 'El archivo debe ser CSV'], 400);
            }

            $handle = fopen($file->getRealPath(), 'r');

            // Detectar delimitador
            $firstLine = fgets($handle);
            rewind($handle);
            $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

            // Leer encabezados
            $header = fgetcsv($handle, 1000, $delimiter);
            if (!empty($header)) {
                $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]); // limpiar BOM
            }

            $insertados = [];
            $errores = [];
            $linea = 1;

            // Mapeo de departamentos
            $mapDepartamentos = [
                'la paz' => 1,
                'santa cruz' => 2,
                'cochabamba' => 3,
                'oruro' => 4,
                'potosí' => 5,
                'chuquisaca' => 6,
                'tarija' => 7,
                'beni' => 8,
                'pando' => 9,
            ];

            while (($row = fgetcsv($handle, 1000, $delimiter)) !== false) {
                $linea++;
                
                try {
                    // Omitir filas completamente vacías
                    if (empty(array_filter($row))) {
                        continue;
                    }
                    // Validar número de columnas
                    if (count($header) !== count($row)) {
                        $errores[] = "Línea $linea: número de columnas incorrecto (esperadas " . count($header) . ", encontradas " . count($row) . ")";
                        continue;
                    }

                    $data = array_combine($header, $row);

                    // Validar campos obligatorios
                    $camposObligatorios = ['ci', 'nombre', 'institucion', 'area', 'nivel'];
                    $camposFaltantes = [];
                    foreach ($camposObligatorios as $campo) {
                        if (empty($data[$campo])) {
                            $camposFaltantes[] = $campo;
                        }
                    }
                    if (count($camposFaltantes) > 0) {
                        $errores[] = "Línea $linea: faltan campos obligatorios -> " . implode(', ', $camposFaltantes);
                        continue;
                    }
                    // Validar formato del CI (solo números y al menos 7 dígitos)
                    if (!preg_match('/^[1-9][0-9]{7,15}$/', $data['ci'])) {
                        $errores[] = "Línea $linea: el CI '{$data['ci']}' no es válido (debe tener solo números y al menos 7 dígitos)";
                        continue;
                    }
                    // Verificar si el CI ya existe en otro registro
                    $olimpistaExistente = Importar_Olimpista::where('ci', $data['ci'])->first();

                    if ($olimpistaExistente) {
                        // Si existe, verificar que nombre y apellidos coincidan
                        if (
                            mb_strtolower(trim($olimpistaExistente->nombre), 'UTF-8') !== mb_strtolower(trim($data['nombre']), 'UTF-8') ||
                            mb_strtolower(trim($olimpistaExistente->apellidos), 'UTF-8') !== mb_strtolower(trim($data['apellidos']), 'UTF-8')
                        ) {
                            $errores[] = "Línea $linea: el CI '{$data['ci']}' ya pertenece a otra persona ({$olimpistaExistente->nombre} {$olimpistaExistente->apellidos})";
                            continue;
                        }
                    }

                    // Buscar ID del área por nombre
                    $nombreArea = mb_strtolower(trim($data['area']), 'UTF-8');
                    $area = Area::whereRaw('LOWER(nombre) = ?', [$nombreArea])->first();
                    if (!$area) {
                        $errores[] = "Línea $linea: el área '{$data['area']}' no existe en la base de datos";
                        continue;
                    }
                    $data['id_area'] = $area->id_area;

                    // Buscar ID del nivel por nombre
                    $nombreNivel = mb_strtolower(trim($data['nivel']), 'UTF-8');
                    $nivel = Nivel::whereRaw('LOWER(nombre) = ?', [$nombreNivel])->first();
                    if (!$nivel) {
                        $errores[] = "Línea $linea: el nivel '{$data['nivel']}' no existe en la base de datos";
                        continue;
                    }
                    $data['id_nivel'] = $nivel->id_nivel;

                    // Convertir departamento a número
                    $id_departamento = $data['id_departamento'] ?? null;
                    if ($id_departamento && !is_numeric($id_departamento)) {
                        $depLower = mb_strtolower(trim($id_departamento), 'UTF-8');
                        if (isset($mapDepartamentos[$depLower])) {
                            $id_departamento = $mapDepartamentos[$depLower];
                        } else {
                            $errores[] = "Línea $linea: departamento no válido ('{$data['id_departamento']}')";
                            continue;
                        }
                    }

                    // Verificar CI duplicado en la misma área
                    $existe = Importar_Olimpista::where('ci', $data['ci'])
                        ->where('id_area', $data['id_area'])
                        ->exists();
                    if ($existe) {
                        $errores[] = "Línea $linea: el CI '{$data['ci']}' ya está registrado en el área '{$data['area']}'";
                        continue;
                    }

                    // Guardar en BD
                    $olimpista = Importar_Olimpista::create([
                        'nombre' => $data['nombre'],
                        'apellidos' => $data['apellidos'] ?? null,
                        'ci' => $data['ci'],
                        'institucion' => $data['institucion'],
                        'id_area' => $data['id_area'],
                        'id_nivel' => $data['id_nivel'],
                        'grado' => $data['grado'] ?? null,
                        'contacto_tutor' => $data['contacto_tutor'] ?? null,
                        'nombre_tutor' => $data['nombre_tutor'] ?? null,
                        'id_departamento' => $id_departamento,
                    ]);

                    $insertados[] = $olimpista;

                } catch (\Throwable $e) {
                    $errores[] = "Línea $linea: error inesperado -> " . $e->getMessage();
                    Log::error("Error en línea $linea: " . $e->getMessage());
                }
            }

            fclose($handle);

            return response()->json([
                'message' => 'Proceso de importación finalizado',
                'total_insertados' => count($insertados),
                'total_errores' => count($errores),
                'insertados' => $insertados,
                'errores' => $errores,
            ]);

        } catch (\Throwable $e) {
            Log::error("Error en importación: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al importar CSV',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
