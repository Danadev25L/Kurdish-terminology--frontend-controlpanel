<?php

namespace App\Modules\Domains\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDomainRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:80|regex:/^[\p{L}\s\-\']+$/u',
            'slug' => 'required|string|max:80|regex:/^[a-z0-9\-]+$/|unique:domains,slug',
            'description' => 'nullable|string|max:300',
            'head_user_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ];
    }
}
