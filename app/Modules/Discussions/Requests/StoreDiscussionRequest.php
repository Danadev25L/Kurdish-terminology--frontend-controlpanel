<?php

namespace App\Modules\Discussions\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiscussionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('expert');
    }

    public function rules(): array
    {
        return [
            'body' => 'required|string|min:5|max:600',
        ];
    }
}
