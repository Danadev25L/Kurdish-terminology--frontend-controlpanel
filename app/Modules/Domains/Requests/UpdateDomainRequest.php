<?php

namespace App\Modules\Domains\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDomainRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'domain-head']);
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:80|regex:/^[\p{L}\s\-\']+$/u',
            'slug' => 'sometimes|string|max:80|regex:/^[a-z0-9\-]+$/|unique:domains,slug,' . $this->route('id'),
            'description' => 'nullable|string|max:300',
            'head_user_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ];
    }
}
