<?php

namespace App\Http\Controllers;

use App\Models\Evaluador;
use App\Models\Usuario;
use App\Models\Area;
use App\Models\Nivel;
use App\Models\Nivel_Fase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class Evaluador_Controller extends Controller
{
    public function index()
    {
        $evaluadores = Evaluador::with(['usuario', 'area'])->get();

        $data = $evaluadores->map(function ($evaluador) {
            return [
                'id_usuario' => $evaluador->usuario->id_usuario,
                'nombre'     => $evaluador->usuario->nombre,
                'apellidos'  => $evaluador->usuario->apellidos,
                'ci'         => $evaluador->usuario->ci,
                'email'      => $evaluador->usuario->email,
                'telefono'   => $evaluador->usuario->telefono,
                'area'       => $evaluador->area->nombre,
            ];
        });

        return response()->json([
            'message' => 'Lista de evaluadores recuperada correctamente.',
            'data'    => $data
        ]);
    }

    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->only([
                'nombre', 'apellidos', 'ci', 'email', 'telefono', 'area'
            ]);

            $data['ci'] = trim($data['ci'] ?? '');

            $validator = Validator::make(
                $data,
                [
                    'nombre'    => 'required|string|max:50',
                    'apellidos' => 'required|string|max:100',
                    'ci'        => [
                        'required',
                        'regex:/^[1-9][0-9]{5,8}$/',
                        'unique:usuario,ci'
                    ],
                    'email'     => 'required|email|max:50|unique:usuario,email',
                    'telefono'  => 'nullable|string|max:15',
                    'area'      => 'required|string|exists:area,nombre',
                ],
                [
                    'nombre.required'    => 'El nombre es obligatorio.',
                    'nombre.max'         => 'El nombre no puede superar los 50 caracteres.',

                    'apellidos.required' => 'Los apellidos son obligatorios.',
                    'apellidos.max'      => 'Los apellidos no pueden superar los 100 caracteres.',

                    'ci.required'        => 'El CI es obligatorio.',
                    'ci.regex'           => 'El CI debe contener solo números y tener entre 6 y 9 dígitos.',
                    'ci.unique'          => 'Este CI ya está registrado.',

                    'email.required'     => 'El correo electrónico es obligatorio.',
                    'email.email'        => 'El correo electrónico no tiene un formato válido.',
                    'email.unique'       => 'Este correo electrónico ya está registrado.',

                    'telefono.max'       => 'El teléfono no puede superar los 15 caracteres.',

                    'area.required'      => 'El área es obligatoria.',
                    'area.exists'        => 'El área indicada no existe.',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Hay errores en los datos enviados.',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $area = Area::whereRaw('LOWER(nombre) = ?', [strtolower($data['area'])])->first();
            if (!$area) {
                return response()->json([
                    'message' => 'El área indicada no fue encontrada.'
                ], 422);
            }

            $plainPassword = $this->generatePassword();

            $usuario = Usuario::create([
                'nombre'     => $data['nombre'],
                'apellidos'  => $data['apellidos'],
                'ci'         => $data['ci'],
                'email'      => $data['email'],
                'telefono'   => $data['telefono'] ?? null,
                'id_rol'     => 3,
                'password'   => Hash::make($plainPassword),
            ]);

            $evaluador = Evaluador::create([
                'id_usuario' => $usuario->id_usuario,
                'id_area'    => $area->id_area,
            ]);

            try {
                Mail::raw(
                    "Hola {$usuario->nombre},\n\n".
                    "Tu cuenta como evaluador del área {$area->nombre} ha sido creada.\n\n".
                    "Correo: {$usuario->email}\n".
                    "Contraseña: {$plainPassword}\n\n".
                    "Atentamente,\nEquipo CochaTech",
                    function ($message) use ($usuario) {
                        $message->to($usuario->email)
                                ->subject('Credenciales de acceso');
                    }
                );
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error('Error enviando correo: '.$e->getMessage());

                return response()->json([
                    'message' => 'No se pudo enviar el correo. El registro fue cancelado.'
                ], 500);
            }

            DB::commit();

            return response()->json([
                'message' => 'Evaluador registrado correctamente y correo enviado.',
                'data' => [
                    'id_usuario' => $usuario->id_usuario,
                    'nombre'     => $usuario->nombre,
                    'apellidos'  => $usuario->apellidos,
                    'ci'         => $usuario->ci,
                    'email'      => $usuario->email,
                    'telefono'   => $usuario->telefono,
                    'area'       => $area->nombre,
                ]
            ], 201);
            

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error registrando evaluador: '.$e->getMessage());

            return response()->json([
                'message' => 'Error interno al registrar evaluador.'
            ], 500);
        }
    }

    public function update(Request $request, $id_usuario)
    {
        try {
            $evaluador = Evaluador::with('usuario')
                ->where('id_usuario', $id_usuario)
                ->first();
    
            if (!$evaluador) {
                return response()->json([
                    'message' => 'Evaluador no encontrado.'
                ], 404);
            }
    
            $userData = $request->only([
                'nombre', 'apellidos', 'ci', 'email', 'telefono'
            ]);
            $areaData = $request->only(['area']);
    
            $validator = Validator::make(
                array_merge($userData, $areaData),
                [
                    'nombre'    => 'nullable|string|max:50',
                    'apellidos' => 'nullable|string|max:100',
                    'ci'        => [
                        'nullable',
                        'regex:/^[1-9][0-9]{6,14}$/',
                        'unique:usuario,ci,' . $evaluador->usuario->id_usuario . ',id_usuario'
                    ],
                    'email'     => 'nullable|email|max:50|unique:usuario,email,' . $evaluador->usuario->id_usuario . ',id_usuario',
                    'telefono'  => 'nullable|string|max:15',
                    'area'      => 'nullable|string|exists:area,nombre',
                ],
                [
                    'ci.regex'     => 'El CI tiene un formato inválido.',
                    'ci.unique'    => 'Este CI ya pertenece a otro usuario.',
                    'email.email'  => 'El correo no tiene un formato válido.',
                    'email.unique' => 'Este correo ya está en uso.',
                    'area.exists'  => 'El área indicada no existe.',
                ]
            );
    
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Hay errores en los datos enviados.',
                    'errors'  => $validator->errors()
                ], 422);
            }
    
            // ⚡ Forzar update aunque no haya cambios
            $evaluador->usuario->fill($userData);
            $evaluador->usuario->save();
    
            if (!empty($areaData['area'])) {
                $area = Area::whereRaw('LOWER(nombre)=?', [strtolower($areaData['area'])])->first();
                if ($area) {
                    $evaluador->id_area = $area->id_area;
                }
            }
    
            $evaluador->save();
    
            return response()->json([
                'message' => 'Evaluador actualizado correctamente.',
                'data'    => $evaluador->load('usuario', 'area')
            ]);
    
        } catch (\Throwable $e) {
            Log::error('Error actualizando evaluador: '.$e->getMessage());
    
            return response()->json([
                'message' => 'Error interno al actualizar evaluador.'
            ], 500);
        }
    }
    
    

    public function destroy($id_usuario)
    {
        DB::beginTransaction();

        try {
            $evaluador = Evaluador::with('usuario')
                ->where('id_usuario', $id_usuario)
                ->first();

            if (!$evaluador) {
                return response()->json([
                    'message' => 'Evaluador no encontrado.'
                ], 404);
            }

            $evaluador->delete();
            $evaluador->usuario->delete();

            DB::commit();

            return response()->json([
                'message' => 'Evaluador eliminado correctamente.'
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error eliminando evaluador: '.$e->getMessage());

            return response()->json([
                'message' => 'Error interno al eliminar evaluador.'
            ], 500);
        }
    }

    private function generatePassword($length = 8)
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@/#';
        $password = '';

        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[rand(0, strlen($chars) - 1)];
        }

        return $password;
    }
}
