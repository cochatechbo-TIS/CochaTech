<?php

namespace App\Http\Controllers;

use App\Models\Importar_Olimpista;
use App\Models\Area;
use App\Models\Nivel;
use App\Models\Equipo;
use App\Models\Equipo_Olimpista;
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
            $firstLine = fgets($handle);
            rewind($handle);
            $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

            // Leer encabezados
            $header = fgetcsv($handle, 1000, $delimiter);
            if (!empty($header)) {
                $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
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
                    if (empty(array_filter($row))) continue;

                    if (count($header) !== count($row)) {
                        $errores[] = "Línea $linea: número de columnas incorrecto (esperadas " . count($header) . ", encontradas " . count($row) . ")";
                        continue;
                    }

                    $data = array_combine($header, $row);

                    // Validar campos obligatorios
                    $camposObligatorios = ['ci', 'nombre', 'institucion', 'area', 'nivel'];
                    $faltantes = array_filter($camposObligatorios, fn($campo) => empty($data[$campo]));
                    if ($faltantes) {
                        $errores[] = "Línea $linea: faltan campos obligatorios -> " . implode(', ', $faltantes);
                        continue;
                    }

                    // Validar CI
                    if (!preg_match('/^[1-9][0-9]{7,15}$/', $data['ci'])) {
                        $errores[] = "Línea $linea: el CI '{$data['ci']}' no es válido (solo números, mínimo 8 dígitos)";
                        continue;
                    }

                    // Buscar área
                    $area = Area::whereRaw('LOWER(nombre) = ?', [mb_strtolower(trim($data['area']), 'UTF-8')])->first();
                    if (!$area) {
                        $errores[] = "Línea $linea: el área '{$data['area']}' no existe";
                        continue;
                    }

                    // Buscar nivel
                    $nivel = Nivel::whereRaw('LOWER(nombre) = ?', [mb_strtolower(trim($data['nivel']), 'UTF-8')])->first();
                    if (!$nivel) {
                        $errores[] = "Línea $linea: el nivel '{$data['nivel']}' no existe";
                        continue;
                    }

                    // Verificar relación nivel → área
                    if ($nivel->id_area !== $area->id_area) {
                        $errores[] = "Línea $linea: el nivel '{$data['nivel']}' no pertenece al área '{$data['area']}'";
                        continue;
                    }

                    // Departamento → ID
                    $id_departamento = $data['id_departamento'] ?? null;
                    if ($id_departamento && !is_numeric($id_departamento)) {
                        $depLower = mb_strtolower(trim($id_departamento), 'UTF-8');
                        $id_departamento = $mapDepartamentos[$depLower] ?? null;
                        if (!$id_departamento) {
                            $errores[] = "Línea $linea: departamento no válido ('{$data['id_departamento']}')";
                            continue;
                        }
                    }

                    // Duplicado en misma área
                    $existe = Importar_Olimpista::where('ci', $data['ci'])
                        ->where('id_area', $area->id_area)
                        ->exists();
                    if ($existe) {
                        $errores[] = "Línea $linea: el CI '{$data['ci']}' ya está registrado en el área '{$data['area']}'";
                        continue;
                    }

                    // Crear olimpista
                    $olimpista = Importar_Olimpista::create([
                        'nombre' => $data['nombre'],
                        'apellidos' => $data['apellidos'] ?? null,
                        'ci' => $data['ci'],
                        'institucion' => $data['institucion'],
                        'id_area' => $area->id_area,
                        'id_nivel' => $nivel->id_nivel,
                        'grado' => $data['grado'] ?? null,
                        'contacto_tutor' => $data['contacto_tutor'] ?? null,
                        'nombre_tutor' => $data['nombre_tutor'] ?? null,
                        'id_departamento' => $id_departamento,
                    ]);

                    // === NUEVO BLOQUE: Equipos ===
                    $nombreEquipo = trim($data['nombre_equipo'] ?? '');
                    if ($nombreEquipo !== '') {
                        // Si el nivel NO es grupal → error
                        if (!$nivel->es_grupal) {
                            $errores[] = "Línea $linea: se intenta registrar el equipo '{$nombreEquipo}' en un nivel individual ('{$data['nivel']}')";
                            continue;
                        }

                        // Crear o reutilizar equipo (nivel grupal)
                        $equipo = Equipo::firstOrCreate([
                            'nombre_equipo' => $nombreEquipo,
                            'id_area' => $area->id_area,
                            'id_nivel' => $nivel->id_nivel,
                        ], [
                            'institucion' => $data['institucion'],
                        ]);

                        // Asociar olimpista al equipo
                        Equipo_Olimpista::firstOrCreate([
                            'id_equipo' => $equipo->id_equipo,
                            'id_olimpista' => $olimpista->id_olimpista,
                        ]);
                    } else {
                        // Si el nivel ES grupal pero no se proporciona equipo → error
                        if ($nivel->es_grupal) {
                            $errores[] = "Línea $linea: el nivel '{$data['nivel']}' es grupal, pero no se especificó un nombre de equipo";
                            continue;
                        }
                    }

                    $insertados[] = $olimpista;
                } catch (\Throwable $e) {
                    $errores[] = "Línea $linea: error inesperado -> " . $e->getMessage();
                    Log::error("Error en línea $linea: " . $e->getMessage());
                }
            }

            fclose($handle);

            return response()->json([
                'message' => 'Importación completada',
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
