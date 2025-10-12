<?php

namespace App\Http\Controllers;

use App\Models\Importar_Olimpista;
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
            $ciVistos = [];
            $filasVistas = [];

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
                    $data = array_combine($header, $row);

                    // Campos obligatorios
                    if (empty($data['ci']) || empty($data['nombre']) || empty($data['institucion'])) {
                        $errores[] = "Línea $linea: Faltan campos obligatorios (ci, nombre o institucion)";
                        continue;
                    }

                    // CI duplicado en el mismo archivo
                    if (in_array($data['ci'], $ciVistos)) {
                        $errores[] = "Línea $linea: CI duplicado en el archivo ({$data['ci']})";
                        continue;
                    }
                    $ciVistos[] = $data['ci'];

                    // Fila duplicada completa
                    $filaHash = md5(json_encode($row));
                    if (in_array($filaHash, $filasVistas)) {
                        $errores[] = "Línea $linea: Fila duplicada en el archivo";
                        continue;
                    }
                    $filasVistas[] = $filaHash;

                    // CI duplicado en BD
                    if (Importar_Olimpista::where('ci', $data['ci'])->exists()) {
                        $errores[] = "Línea $linea: CI ya existe en la base de datos ({$data['ci']})";
                        continue;
                    }

                    // Convertir departamento a número
                    $id_departamento = $data['id_departamento'] ?? null;
                    if ($id_departamento && !is_numeric($id_departamento)) {
                        $depLower = mb_strtolower(trim($id_departamento), 'UTF-8');
                        if (isset($mapDepartamentos[$depLower])) {
                            $id_departamento = $mapDepartamentos[$depLower];
                        } else {
                            $errores[] = "Línea $linea: Departamento no válido ({$id_departamento})";
                            continue;
                        }
                    }

                    // Guardar en BD
                    $olimpista = Importar_Olimpista::create([
                    'nombre' => $data['nombre'],
                    'apellidos' => $data['apellidos'] ?? null,
                    'ci' => $data['ci'],
                    'institucion' => $data['institucion'],
                    'id_area' => $data['area'],   // <- cambiar 'area' por 'id_area'
                    'id_nivel' => $data['nivel'], // <- cambiar 'nivel' por 'id_nivel'
                    'grado' => $data['grado'] ?? null,
                    'contacto_tutor' => $data['contacto_tutor'] ?? null,
                    'nombre_tutor' => $data['nombre_tutor'] ?? null,
                    'id_departamento' => $id_departamento,
                    ]);

                    $insertados[] = $olimpista;

                } catch (\Throwable $e) {
                    $errores[] = "Error en línea $linea: " . $e->getMessage();
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
