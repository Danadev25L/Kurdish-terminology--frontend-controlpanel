<?php

namespace App\Modules\Concepts\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConceptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['expert', 'domain-head', 'admin']);
    }

    public function rules(): array
    {
        return [
            'domain_id' => 'required|exists:domains,id',
            'english_term' => 'required|string|max:200',
            'definition' => 'required|string|min:10|max:800',
            'part_of_speech_id' => 'nullable|exists:parts_of_speech,id',
            'notes' => 'nullable|string|max:300',
        ];
    }
}
