<?php

namespace App\Http\Controllers;

use App\Models\Evaluador;
use App\Models\User;
use App\Models\Area;
// use App\Models\Nivel; // <-- ELIMINADO
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class EvaluadorController extends Controller
{
    public function index()
    {
        // Quitado with('nivel')
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
                // 'nivel' => $evaluador->nivel?->nombre,  // <-- ELIMINADO
                // 'disponible' => $evaluador->disponible, // <-- ELIMINADO
            ];
        });

        return response()->json([
            'message' => 'Lista de evaluadores recuperada correctamente',
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        DB::beginTransaction(); 

        try {
            // Quitados 'nivel' y 'disponible'
            $data = $request->only([
                'nombre', 'apellidos', 'ci', 'email', 'telefono', 'area'
            ]);

            $validator = Validator::make($data, [
                'nombre' => 'required|string|max:50',
                'apellidos' => 'required|string|max:100',
                'ci' => 'required|string|max:15|unique:usuario,ci',
                'email' => 'required|email|max:50|unique:usuario,email',
                'telefono' => 'nullable|string|max:15',
                'area' => 'required|string|exists:area,nombre',
                // 'nivel' => 'nullable|string|exists:nivel,nombre', // <-- ELIMINADO
                // 'disponible' => 'nullable|boolean'               // <-- ELIMINADO
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación, verifica CI o email.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $area = Area::whereRaw('LOWER(nombre) = ?', [strtolower($data['area'])])->first();
            if (!$area) {
                return response()->json(['message' => 'Área no encontrada'], 422);
            }
            
            // Lógica de buscar Nivel ELIMINADA

            // Crear usuario
            $plainPassword = $this->generatePassword();
            
            $usuario = User::create([
                'nombre' => $data['nombre'],
                'apellidos' => $data['apellidos'],
                'ci' => $data['ci'],
                'email' => $data['email'],
                'telefono' => $data['telefono'] ?? null,
                'id_rol' => 3, // Evaluador
                'password' => Hash::make($plainPassword),
            ]);

            // Crear evaluador (sin nivel ni disponible)
            $evaluador = Evaluador::create([
                'id_usuario' => $usuario->id_usuario,
                'id_area' => $area->id_area,
                // 'id_nivel' => $nivel?->id_nivel,      // <-- ELIMINADO
                // 'disponible' => $data['disponible'], // <-- ELIMINADO
            ]);

            try {
                Mail::raw(
                    "Hola {$usuario->nombre},\n\n".
                    // Mensaje actualizado (quitado "de {$area->nombre}")
                    "Tu cuenta como evaluador ha sido creada en Oh!SanSi.\n". 
                    "Correo: {$usuario->email}\n".
                    "Contraseña: {$plainPassword}\n\n".
                    "Atentamente,\nEl equipo de CochaTech",
                    function ($message) use ($usuario) {
                        $message->to($usuario->email)
                                ->subject('Credenciales de acceso - CochaTech');
                    }
                );
            } catch (\Throwable $mailError) {
                DB::rollBack();
                Log::error('Error enviando correo: '.$mailError->getMessage());
                return response()->json([
                    'message' => 'No se pudo enviar el correo. Registro cancelado.',
                    'error' => $mailError->getMessage()
                ], 500);
            }

            DB::commit();

            return response()->json([
                'message' => 'Evaluador registrado y correo enviado correctamente',
                'usuario' => $usuario,
                'evaluador' => $evaluador,
                'password_generada' => $plainPassword
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
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

            // Quitados 'nivel' y 'disponible'
            $data = $request->only(['nombre', 'apellidos', 'ci', 'email', 'telefono', 'area']);

            $validator = Validator::make($data, [
                'nombre' => 'nullable|string|max:50',
                'apellidos' => 'nullable|string|max:100',
                'ci' => 'nullable|string|max:15',
                'email' => 'nullable|email|max:50|unique:usuario,email,' . $evaluador->usuario->id_usuario . ',id_usuario',
                'telefono' => 'nullable|string|max:15',
                'area' => 'nullable|string|exists:area,nombre',
                // 'nivel' => 'nullable|string|exists:nivel,nombre', // <-- ELIMINADO
                // 'disponible' => 'nullable|boolean',               // <-- ELIMINADO
            ]);

            if ($validator->fails()) {
                return response()->json(['message'=>'Errores de validación','errors'=>$validator->errors()], 422);
            }

            $evaluador->usuario->update($data);

            if (isset($data['area'])) {
                $area = Area::whereRaw('LOWER(nombre)=?', [strtolower($data['area'])])->first();
                if ($area) {
                    $evaluador->id_area = $area->id_area;
                }
            }

            // Lógica de Nivel ELIMINADA
            // Lógica de Disponible ELIMINADA
            
            $evaluador->save();

            return response()->json([
                'message' => 'Evaluador actualizado correctamente',
                'data' => $evaluador->load('usuario', 'area') // Quitado 'nivel'
            ]);
        } catch (\Throwable $e) {
            Log::error('Error actualizando evaluador: ' . $e->getMessage());
            return response()->json(['message'=>'Error actualizando evaluador','error'=>$e->getMessage()], 500);
        }
    }

    public function destroy($id_usuario)
    {
        // (El método 'destroy' no necesita cambios, ya funciona bien)
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
}
