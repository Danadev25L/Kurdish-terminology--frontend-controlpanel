<?php

namespace App\Modules\Voting\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('expert');
    }

    public function rules(): array
    {
        return [
            'vote' => 'required|boolean',
        ];
    }
}
