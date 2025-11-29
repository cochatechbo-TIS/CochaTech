<?php

namespace App\Http\Controllers;

use App\Models\Evaluador;
use App\Models\Usuario;
use App\Models\Area;
use App\Models\Nivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\Fase; // <-- Añadir
use App\Models\Estado_Fase; // <-- Añadir
use Illuminate\Support\Facades\Auth;
use App\Models\Nivel_Fase;


class Evaluador_Controller extends Controller
{
    public function index()
    {
        $evaluadores = Evaluador::with(['usuario', 'area'])->get();

        $data = $evaluadores->map(function ($evaluador) {
            return [
                'id_usuario' => $evaluador->usuario->id_usuario,
                'nombre' => $evaluador->usuario->nombre,
                'apellidos' => $evaluador->usuario->apellidos,
                'ci' => $evaluador->usuario->ci,
                'email' => $evaluador->usuario->email,
                'telefono' => $evaluador->usuario->telefono,
                'area' => $evaluador->area->nombre,
                //'nivel' => $evaluador->nivel?->nombre,
                //'disponible' => $evaluador->disponible ?? true,
            ];
        });

        return response()->json([
            'message' => 'Lista de evaluadores recuperada correctamente',
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        DB::beginTransaction(); // Iniciar transacción

        try {
            $data = $request->only([
                'nombre', 'apellidos', 'ci', 'email', 'telefono', 'area'
            ]);
            $data['ci'] = trim($data['ci'] ?? '');//para limpiar espacios ojito
            //Log::info('CI recibido: [' . $data['ci'] . ']');
            $validator = Validator::make($data, [
                'nombre' => 'required|string|max:50',
                'apellidos' => 'required|string|max:100',
                'ci' => [
                    'required',
                    'regex:/^[1-9][0-9]{5,8}$/',
                    'unique:usuario,ci'
                ],
                'email' => 'required|email|max:50|unique:usuario,email',
                'telefono' => 'nullable|string|max:15',
                'area' => 'required|string|exists:area,nombre',
                //'nivel' => 'nullable|string|exists:nivel,nombre',
                //'disponible' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación, verifica CI o email.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar el área (case-insensitive)
            $area = Area::whereRaw('LOWER(nombre) = ?', [strtolower($data['area'])])->first();
            if (!$area) {
                return response()->json(['message' => 'Área no encontrada'], 422);
            }

            // Buscar el nivel si se proporcionó
            /*$nivel = isset($data['nivel'])
                ? Nivel::whereRaw('LOWER(nombre) = ?', [strtolower($data['nivel'])])->first()
                : null;*/

            // Crear usuario
            $plainPassword = $this->generatePassword();
            $usuario = Usuario::create([
                'nombre' => $data['nombre'],
                'apellidos' => $data['apellidos'],
                'ci' => $data['ci'],
                'email' => $data['email'],
                'telefono' => $data['telefono'] ?? null,
                'id_rol' => 3, // Evaluador
                'password' => Hash::make($plainPassword),
            ]);

            // Crear evaluador
            $evaluador = Evaluador::create([
                'id_usuario' => $usuario->id_usuario,
                'id_area' => $area->id_area,
                //'id_nivel' => $nivel?->id_nivel,
                //'disponible' => $data['disponible'] ?? true,
            ]);

            // Enviar correo
            try {
                Mail::raw(
                    "Hola {$usuario->nombre},\n\n".
                    "Tu cuenta como evaluador de {$area->nombre} ha sido creada en Oh!SanSi.\n".
                    "Correo: {$usuario->email}\n".
                    "Contraseña: {$plainPassword}\n\n".
                    "Atentamente,\nEl equipo de CochaTech",
                    function ($message) use ($usuario) {
                        $message->to($usuario->email)
                                ->subject('Credenciales de acceso - CochaTech');
                    }
                );
            } catch (\Throwable $mailError) {
                DB::rollBack(); //  Si el correo falla, revertimos todo
                Log::error('Error enviando correo: '.$mailError->getMessage());
                return response()->json([
                    'message' => 'No se pudo enviar el correo. Registro cancelado.',
                    'error' => $mailError->getMessage()
                ], 500);
            }

            DB::commit(); // Confirmar cambios si todo salió bien

            return response()->json([
                'message' => 'Evaluador registrado y correo enviado correctamente',
                'usuario' => $usuario,
                'evaluador' => $evaluador,
                'password_generada' => $plainPassword
            ]);
        } catch (\Throwable $e) {
            DB::rollBack(); // Asegurar rollback ante cualquier otro error
            Log::error('Error registrando evaluador: '.$e->getMessage());
            return response()->json([
                'message' => 'Error registrando evaluador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id_usuario)
    {
        try {
            
            $evaluador = Evaluador::with('usuario')->where('id_usuario', $id_usuario)->first();
            if (!$evaluador) {
                return response()->json(['message' => 'Evaluador no encontrado'], 404);
            }

            $data = $request->only(['nombre', 'apellidos', 'ci', 'email', 'telefono', 'area']);

            $validator = Validator::make($data, [
                'nombre' => 'nullable|string|max:50',
                'apellidos' => 'nullable|string|max:100',
                'ci' => [
                    'nullable',
                    'regex:/^[1-9][0-9]{6,14}$/',
                    'unique:usuario,ci,' . $evaluador->usuario->id_usuario . ',id_usuario'
                ],
                'email' => 'nullable|email|max:50|unique:usuario,email,' . $evaluador->usuario->id_usuario . ',id_usuario',
                'telefono' => 'nullable|string|max:15',
                'area' => 'nullable|string|exists:area,nombre',
                //'nivel' => 'nullable|string|exists:nivel,nombre',
                //'disponible' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['message'=>'Errores de validación','errors'=>$validator->errors()], 422);
            }

            $evaluador->usuario->update($data);

            // Actualizar área si viene nombre
            if (isset($data['area'])) {
                $area = Area::whereRaw('LOWER(nombre)=?', [strtolower($data['area'])])->first();
                if ($area) {
                    $evaluador->id_area = $area->id_area;
                }
            }

            /*// Actualizar nivel si viene nombre
            if (isset($data['nivel'])) {
                $nivel = Nivel::whereRaw('LOWER(nombre)=?', [strtolower($data['nivel'])])->first();
                $evaluador->id_nivel = $nivel?->id_nivel;
            }*/

            // Actualizar disponibilidad si viene
            /*if (isset($data['disponible'])) {
                $evaluador->disponible = $data['disponible'];
            }*/

            $evaluador->save();

            return response()->json([
                'message' => 'Evaluador actualizado correctamente',
                'data' => $evaluador->load('usuario', 'area')
            ]);
        } catch (\Throwable $e) {
            Log::error('Error actualizando evaluador: ' . $e->getMessage());
            return response()->json(['message'=>'Error actualizando evaluador','error'=>$e->getMessage()], 500);
        }
    }

    public function destroy($id_usuario)
    {
        DB::beginTransaction();
        try {
            $evaluador = Evaluador::with('usuario')->where('id_usuario', $id_usuario)->first();

            if (!$evaluador) {
                DB::rollBack();
                return response()->json(['message' => 'Evaluador no encontrado'], 404);
            }

            $evaluador->delete();
            $evaluador->usuario->delete();

            DB::commit();
            return response()->json(['message' => 'Evaluador eliminado correctamente']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error eliminando evaluador: '.$e->getMessage());
            return response()->json(['message'=>'Error eliminando evaluador','error'=>$e->getMessage()], 500);
        }
    }

    private function generatePassword($length = 8)
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@/#';
        $password = '';
        for ($i=0; $i<$length; $i++) $password .= $chars[rand(0, strlen($chars)-1)];
        return $password;
    }
   public function obtenerDatosIniciales(Request $request, $idNivel = null)
    {
        // Si llega un idNivel → lo usamos
        if ($idNivel) {
            $nivel = Nivel::with('area')->where('id_nivel', $idNivel)->first();

            if (!$nivel) {
                return response()->json(['message' => 'Nivel no encontrado.'], 404);
            }
        } 
        else {
            // Si NO llega idNivel → obtener el primer nivel asignado a algún evaluador
            $nivel = Nivel::with('area')->whereNotNull('id_evaluador')->first();

            if (!$nivel) {
                return response()->json(['message' => 'No existe un nivel asignado a ningún evaluador.'], 404);
            }
        }

        // Obtener evaluador del nivel
        $evaluador = Evaluador::with('usuario')
            ->where('id_evaluador', $nivel->id_evaluador)
            ->first();

        if (!$evaluador) {
            return response()->json(['message' => 'No existe un evaluador asociado a este nivel.'], 404);
        }

        // Info evaluador
        $infoEvaluador = [
            'nombre_evaluador' => $evaluador->usuario->nombre . ' ' . $evaluador->usuario->apellidos,
            'nombre_nivel' => $nivel->nombre,
            'nombre_area' => $nivel->area->nombre,
            'id_nivel' => $nivel->id_nivel,
            'es_grupal' => $nivel->es_grupal,
        ];

        // Fases
        $fases = Nivel_Fase::with(['fase', 'estado_fase'])
            ->where('id_nivel', $nivel->id_nivel)
            ->orderBy('id_nivel_fase', 'asc')
            ->get()
            ->map(function ($nf) {
                return [
                    'id_nivel_fase' => $nf->id_nivel_fase,
                    'nombre_fase'   => $nf->fase->nombre,
                    'orden'         => $nf->fase->orden,
                    'estado'        => $nf->estado_fase->nombre_estado ?? 'Desconocido',
                ];
            });

        return response()->json([
            'infoEvaluador' => $infoEvaluador,
            'fases' => $fases
        ]);
        \Log::info("LLEGA ID NIVEL: " . json_encode($idNivel));
    }
}