<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\OlimpistasImport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Illuminate\Support\Facades\Log;

class ImportarOlimpistaController extends Controller
{
    /**
     * Maneja la importación de un archivo CSV de olimpistas.
     */
    public function importar(Request $request)
    {
        // 1. Validación simple del archivo
        $request->validate([
            'file' => 'required|file|mimes:csv,txt' // Acepta csv o txt
        ]);

        // 2. Crear una instancia del importador
        $import = new OlimpistasImport();

        try {
            // 3. Ejecutar la importación
            // La librería maneja automáticamente delimitadores, BOMs, etc.
            Excel::import($import, $request->file('file'));

            return response()->json([
                'message' => 'Importación completada exitosamente.',
                // Puedes agregar contadores si los implementas en la clase Import
            ]);

        } catch (ValidationException $e) {
            // 4. Capturar errores de validación (de la clase Import)
            $failures = $e->failures();
            $errores = [];

            foreach ($failures as $failure) {
                $errores[] = [
                    'linea' => $failure->row(), // Línea del CSV donde ocurrió el error
                    'columna' => $failure->attribute(), // Columna (ej. 'ci')
                    'errores' => $failure->errors(), // Mensajes (ej. 'El CI ya existe')
                ];
            }

            return response()->json([
                'message' => 'La importación falló debido a errores de validación.',
                'total_errores' => count($errores),
                'errores' => $errores,
            ], 422); // 422 Unprocessable Entity

        } catch (\Throwable $e) {
            // 5. Capturar cualquier otro error inesperado
            Log::error("Error general en importación: " . $e->getMessage());
            return response()->json([
                'message' => 'Error inesperado durante la importación.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}