<?php

namespace App\Modules\Concepts\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConceptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['expert', 'domain-head', 'admin']);
    }

    public function rules(): array
    {
        return [
            'definition' => 'sometimes|string|min:10|max:800',
            'notes' => 'nullable|string|max:300',
            'priority' => 'sometimes|in:low,normal,high,critical',
        ];
    }
}
