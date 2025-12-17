<?php

namespace App\Http\Controllers;

use App\Models\Responsable_Area;
use App\Models\Usuario;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class Responsable_Area_Controller extends Controller
{
    public function index()
    {
        $responsables = Responsable_Area::with(['usuario.rol', 'area'])->get();

        $data = $responsables->map(function ($responsable) {
            return [
                'id_usuario' => $responsable->usuario->id_usuario,
                'nombre' => $responsable->usuario->nombre,
                'apellidos' => $responsable->usuario->apellidos,
                'ci' => $responsable->usuario->ci,
                'email' => $responsable->usuario->email,
                'telefono' => $responsable->usuario->telefono,
                'area' => $responsable->area->nombre,
                'id_rol' => $responsable->usuario->id_rol,
            ];
        });

        return response()->json([
            'message' => 'Lista de responsables recuperada correctamente.',
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        DB::beginTransaction(); 

        try {
            $data = $request->only(['nombre', 'apellidos', 'ci', 'email', 'telefono', 'area']);
            $data['ci'] = trim($data['ci'] ?? '');

            $validator = Validator::make(
                $data,
                [
                    'nombre'    => 'required|string|max:50',
                    'apellidos' => 'required|string|max:100',
                    'ci'        => ['required','regex:/^[1-9][0-9]{5,14}$/','unique:usuario,ci'],
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
                    'ci.regex'           => 'El CI debe contener solo números y tener entre 6 y 15 dígitos.',
                    'ci.unique'          => 'Este CI ya está registrado.',

                    'email.required'     => 'El correo electrónico es obligatorio.',
                    'email.email'        => 'El correo no tiene un formato válido.',
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
                'id_rol'     => 2,
                'password'   => Hash::make($plainPassword),
            ]);

            $responsable = Responsable_Area::create([
                'id_usuario' => $usuario->id_usuario,
                'id_area'    => $area->id_area
            ]);

            try {
                Mail::raw(
                    "Hola {$usuario->nombre},\n\n".
                    "Tu cuenta como Responsable del área {$area->nombre} ha sido creada.\n".
                    "Correo: {$usuario->email}\n".
                    "Contraseña: {$plainPassword}\n\n".
                    "Atentamente,\nEquipo CochaTech",
                    function ($message) use ($usuario) {
                        $message->to($usuario->email)
                                ->subject('Credenciales de acceso');
                    }
                );
            } catch (\Throwable $mailError) {
                DB::rollBack();
                Log::error('Error enviando correo: '.$mailError->getMessage());
                return response()->json([
                    'message' => 'No se pudo enviar el correo. El registro fue cancelado.',
                ], 500);
            }

            DB::commit();

            return response()->json([
                'message' => 'Responsable registrado correctamente y correo enviado.',
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
            Log::error('Error registrando responsable: '.$e->getMessage());
            return response()->json([
                'message' => 'Error interno al registrar responsable.'
            ], 500);
        }
    }

    public function update(Request $request, $id_usuario)
    {
        try {
            $responsable = Responsable_Area::with('usuario')
                ->where('id_usuario', $id_usuario)
                ->first();
    
            if (!$responsable) {
                return response()->json(['message' => 'Responsable no encontrado.'], 404);
            }
    
            $userData = $request->only(['nombre','apellidos','ci','email','telefono']);
            $areaData = $request->only(['area']);
    
            $validator = Validator::make(
                array_merge($userData, $areaData),
                [
                    'nombre'    => 'nullable|string|max:50',
                    'apellidos' => 'nullable|string|max:100',
                    'ci'        => ['nullable','regex:/^[1-9][0-9]{5,14}$/','unique:usuario,ci,'.$responsable->usuario->id_usuario.',id_usuario'],
                    'email'     => 'nullable|email|max:50|unique:usuario,email,'.$responsable->usuario->id_usuario.',id_usuario',
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
    
            // Guardar correo antiguo para comparación
            $oldEmail = $responsable->usuario->email;
    
            // Actualizar datos del usuario
            $responsable->usuario->fill($userData);
    
            $newPassword = null; // variable para la nueva contraseña
    
            // Si el email cambió, generar nueva contraseña
            if (!empty($userData['email']) && $userData['email'] !== $oldEmail) {
                $newPassword = $this->generatePassword();
                $responsable->usuario->password = Hash::make($newPassword);
            }
    
            $responsable->usuario->save();
    
            // Actualizar área si viene en request
            if (!empty($areaData['area'])) {
                $area = Area::whereRaw('LOWER(nombre) = ?', [strtolower($areaData['area'])])->first();
                if ($area) {
                    $responsable->id_area = $area->id_area;
                }
            }
            
            $responsable->save();
    
            // Enviar correo si el email cambió
            if (!empty($userData['email']) && $userData['email'] !== $oldEmail) {
                try {
                    Mail::raw(
                        "Hola {$responsable->usuario->nombre},\n\n".
                        "Tu correo ha sido actualizado en el sistema.\n".
                        "Nuevo correo: {$responsable->usuario->email}\n".
                        "Contraseña temporal: {$newPassword}\n\n".
                        "Por favor, cambia tu contraseña después de iniciar sesión.\n\n".
                        "Atentamente,\nEquipo CochaTech",
                        function ($message) use ($responsable) {
                            $message->to($responsable->usuario->email)
                                    ->subject('Actualización de credenciales');
                        }
                    );
                } catch (\Throwable $mailError) {
                    Log::error('Error enviando correo de actualización: '.$mailError->getMessage());
                    // Puedes decidir si quieres fallar la actualización o solo registrar el error
                }
            }
    
            return response()->json([
                'message' => 'Responsable actualizado correctamente.',
                'data' => $responsable->load('usuario', 'area')
            ]);
    
        } catch (\Throwable $e) {
            Log::error('Error actualizando responsable: '.$e->getMessage());
            return response()->json([
                'message' => 'Error interno al actualizar responsable.'
            ], 500);
        }
    }
    


    public function destroy($id_usuario)
    {
        DB::beginTransaction();
        try {
            $responsable = Responsable_Area::with('usuario')
                ->where('id_usuario', $id_usuario)
                ->first();

            if (!$responsable) {
                return response()->json(['message' => 'Responsable no encontrado.'], 404);
            }

            $responsable->delete();
            $responsable->usuario->delete();

            DB::commit();

            return response()->json([
                'message' => 'Responsable eliminado correctamente.'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error eliminando responsable: '.$e->getMessage());
            return response()->json([
                'message' => 'Error interno al eliminar responsable.'
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
