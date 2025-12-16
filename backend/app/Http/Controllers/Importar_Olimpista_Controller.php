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
            // Verificar archivo
            if (!$request->hasFile('file')) {
                return response()->json([
                    'message' => 'Se encontraron errores en el CSV',
                    'errores' => ['No se encontró archivo CSV'],
                ], 422);
            }

            $file = $request->file('file');
            if ($file->getClientOriginalExtension() !== 'csv') {
                return response()->json([
                    'message' => 'Se encontraron errores en el CSV',
                    'errores' => ['El archivo debe ser CSV'],
                ], 422);
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

            // Normalizar encabezados
            $header = array_map(function ($h) {
                $h = mb_strtolower(trim($h), 'UTF-8');
                $h = str_replace(['á','é','í','ó','ú','ñ'], ['a','e','i','o','u','n'], $h);
                return $h;
            }, $header);

            $encabezadosEsperados = [
                'ci','nombre','apellidos','institucion','area','nivel',
                'grado','departamento','nombre_tutor','contacto_tutor','nombre_equipo',
            ];

            // Validar encabezados mínimos
            $camposMinimos = ['ci','nombre','institucion','area','nivel','grado','departamento'];
            $coincidentesMinimos = array_intersect($camposMinimos, $header);

            if (count($coincidentesMinimos) === 0) {
                return response()->json([
                    'message' => 'Se encontraron errores en el CSV',
                    'errores' => ['Todos los nombres de los encabezados son incorrectos'],
                ], 422);
            }

            // Validar faltantes y sobrantes
            $faltantes = array_diff($encabezadosEsperados, $header);
            $sobrantes = array_diff($header, $encabezadosEsperados);

            if (!empty($faltantes) || !empty($sobrantes)) {
                return response()->json([
                    'message' => 'Se encontraron errores en el CSV',
                    'faltan' => array_values($faltantes),
                    'sobran' => array_values($sobrantes),
                ], 422);
            }

            if (!$header || count($header) === 0) {
                return response()->json([
                    'message' => 'Se encontraron errores en el CSV',
                    'errores' => ['El archivo CSV no tiene encabezados válidos'],
                ], 422);
            }

            $insertados = [];
            $errores = [];
            $linea = 1;

            $mapDepartamentos = [
                'la paz' => 1,'santa cruz' => 2,'cochabamba' => 3,'oruro' => 4,
                'potosi' => 5,'chuquisaca' => 6,'tarija' => 7,'beni' => 8,'pando' => 9,
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

                    // Campos obligatorios
                    $camposObligatorios = ['ci','nombre','institucion','area','nivel'];
                    $faltantesFila = array_filter($camposObligatorios, fn($c) => empty($data[$c]));
                    if ($faltantesFila) {
                        $errores[] = "Línea $linea: faltan campos obligatorios -> " . implode(', ', $faltantesFila);
                        continue;
                    }

                    // Validar CI
                    if (!preg_match('/^[1-9][0-9]{7,15}$/', $data['ci'])) {
                        $errores[] = "Línea $linea: el CI '{$data['ci']}' no es válido";
                        continue;
                    }

                    // Área
                    $area = Area::whereRaw('LOWER(nombre)=?', [mb_strtolower(trim($data['area']), 'UTF-8')])->first();
                    if (!$area) {
                        $errores[] = "Línea $linea: el área '{$data['area']}' no existe";
                        continue;
                    }

                    // Nivel
                    $nivel = Nivel::whereRaw('LOWER(nombre)=?', [mb_strtolower(trim($data['nivel']), 'UTF-8')])->first();
                    if (!$nivel) {
                        $errores[] = "Línea $linea: el nivel '{$data['nivel']}' no existe";
                        continue;
                    }

                    if ($nivel->id_area !== $area->id_area) {
                        $errores[] = "Línea $linea: el nivel '{$data['nivel']}' no pertenece al área '{$data['area']}'";
                        continue;
                    }

                    // Departamento
                    $id_departamento = $data['departamento'] ?? null;
                    if ($id_departamento && !is_numeric($id_departamento)) {
                        $depLower = mb_strtolower(trim($id_departamento), 'UTF-8');
                        $id_departamento = $mapDepartamentos[$depLower] ?? null;
                        if (!$id_departamento) {
                            $errores[] = "Línea $linea: departamento no válido ('{$data['departamento']}')";
                            continue;
                        }
                    }

                    // Duplicados
                    $existe = Importar_Olimpista::where('ci', $data['ci'])->where('id_area', $area->id_area)->exists();
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

                    // Equipo
                    $nombreEquipo = trim($data['nombre_equipo'] ?? '');
                    if ($nombreEquipo !== '') {
                        if (!$nivel->es_grupal) {
                            $errores[] = "Línea $linea: se intenta registrar el equipo '{$nombreEquipo}' en un nivel individual ('{$data['nivel']}')";
                            continue;
                        }

                        $equipo = Equipo::firstOrCreate([
                            'nombre_equipo' => $nombreEquipo,
                            'id_area' => $area->id_area,
                            'id_nivel' => $nivel->id_nivel,
                        ], ['institucion' => $data['institucion']]);

                        Equipo_Olimpista::firstOrCreate([
                            'id_equipo' => $equipo->id_equipo,
                            'id_olimpista' => $olimpista->id_olimpista,
                        ]);
                    } else if ($nivel->es_grupal) {
                        $errores[] = "Línea $linea: el nivel '{$data['nivel']}' es grupal, pero no se especificó un nombre de equipo";
                        continue;
                    }

                    $insertados[] = $olimpista;

                } catch (\Throwable $e) {
                    $errores[] = "Línea $linea: error inesperado -> " . $e->getMessage();
                    Log::error("Error en línea $linea: " . $e->getMessage());
                }
            }

            fclose($handle);

            // Si hubo errores en filas → devolver 422 unificado
            if (count($errores) > 0) {
                return response()->json([
                    'message' => 'Se encontraron errores en el archivo CSV',
                    'errores' => $errores,
                ], 422);
            }

            return response()->json([
                'message' => 'Importación completada',
                'total_insertados' => count($insertados),
                'total_errores' => count($errores),
                'insertados' => $insertados,
            ]);

        } catch (\Throwable $e) {
            Log::error("Error en importación: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al importar CSV',
                'errores' => [$e->getMessage()],
            ], 422);
        }
    }
}
