<?php

namespace App\Http\Controllers;

use App\Models\ImportarOlimpista;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ImportarOlimpistaController extends Controller
{
    /**
     * Importar olimpistas desde un archivo CSV
     */
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
            $header = fgetcsv($handle, 1000, ','); // primera fila: encabezados

            $insertados = [];
            $linea = 1;

            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                $linea++;
                try {
                    $data = array_combine($header, $row);

                    $olimpista = ImportarOlimpista::create([
                        'ci' => $data['ci'] ?? null,
                        'nombre' => $data['nombre'] ?? '',
                        'institucion' => $data['institucion'] ?? null,
                        'area' => $data['area'] ?? null,
                        'nivel' => $data['nivel'] ?? null,
                        'grado' => $data['grado'] ?? null,
                        'contacto_tutor' => $data['contacto_tutor'] ?? null,
                        'id_departamento' => $data['id_departamento'] ?? null,
                    ]);

                    $insertados[] = $olimpista;
                } catch (\Throwable $e) {
                    Log::error("Error en línea $linea: " . $e->getMessage());
                }
            }

            fclose($handle);

            return response()->json([
                'message' => 'Importación completada',
                'total_insertados' => count($insertados),
                'data' => $insertados
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
