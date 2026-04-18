<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Admin only in practice via middleware
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:80',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'preferred_language' => 'nullable|in:en,ku',
        ];
    }
}
