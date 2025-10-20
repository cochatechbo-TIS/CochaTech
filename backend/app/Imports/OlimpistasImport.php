<?php

namespace App\Imports;

use App\Models\Olimpista;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Validators\Failure;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Illuminate\Validation\Rule;
use Throwable;

class OlimpistasImport implements 
    ToModel,
    WithHeadingRow,
    WithValidation,
    WithBatchInserts,
    SkipsOnFailure, // No detenerse si falla una validación
    SkipsOnError    // No detenerse si hay un error de BD (ej. duplicado)
{
    use Importable;

    /**
     * Mapeo de departamentos (texto a ID)
     * Extraído de tu controlador anterior.
     */
    private $mapDepartamentos = [
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

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // 1. Convertir el departamento si es un nombre
        $id_departamento = $row['id_departamento'] ?? null;
        if ($id_departamento && !is_numeric($id_departamento)) {
            $depLower = mb_strtolower(trim($id_departamento), 'UTF-8');
            $id_departamento = $this->mapDepartamentos[$depLower] ?? null; // Devuelve null si no se encuentra
        }

        // 2. Crear el modelo Olimpista
        // Laravel Excel ahora maneja la creación fila por fila (o en lotes)
        return new Olimpista([
            'nombre'          => $row['nombre'],
            'apellidos'       => $row['apellidos'] ?? null,
            'ci'              => $row['ci'],
            'institucion'     => $row['institucion'],
            'id_area'         => $row['area'], // Asume que la columna 'area' del CSV tiene el ID del área
            'id_nivel'        => $row['nivel'], // Asume que la columna 'nivel' del CSV tiene el ID del nivel
            'grado'           => $row['grado'] ?? null,
            'contacto_tutor'  => $row['contacto_tutor'] ?? null,
            'nombre_tutor'    => $row['nombre_tutor'] ?? null,
            'id_departamento' => $id_departamento,
        ]);
    }

    /**
     * Reglas de validación para cada fila.
     * Esto reemplaza todas tus comprobaciones manuales (empty, exists, etc.)
     */
    public function rules(): array
    {
        return [
            'ci' => 'required|string|max:15|unique:olimpista,ci',
            'nombre' => 'required|string|max:100',
            'institucion' => 'required|string|max:150',
            
            // Valida que el ID en la columna 'area' del CSV exista en la tabla 'area'.
            'area' => 'required|integer|exists:area,id_area',
            
            // Valida que el ID en la columna 'nivel' del CSV exista en la tabla 'nivel'.
            'nivel' => 'required|integer|exists:nivel,id_nivel',

            // 'id_departamento' puede ser un número o un texto válido
            'id_departamento' => ['required', function ($attribute, $value, $fail) {
                if (is_numeric($value)) {
                    if (!in_array($value, range(1, 9))) { // Asumiendo que los IDs de depto son del 1 al 9
                        $fail('El ID del departamento no es válido.');
                    }
                } else {
                    $depLower = mb_strtolower(trim($value), 'UTF-8');
                    if (!isset($this->mapDepartamentos[$depLower])) {
                        $fail('El nombre del departamento no es válido: '.$value);
                    }
                }
            }],
        ];
    }

    /**
     * Define el tamaño del lote para inserciones masivas (mejor rendimiento).
     */
    public function batchSize(): int
    {
        return 1000; // Inserta 1000 registros a la vez
    }

    // Estos métodos son necesarios para SkipsOnFailure
    public function onFailure(Failure ...$failures)
    {
        // Se pueden registrar los fallos si se desea, pero la librería ya los maneja
    }

    // Estos métodos son necesarios para SkipsOnError
    public function onError(Throwable $e)
    {
        // Se puede registrar el error (ej. Log::error($e->getMessage()))
    }
}