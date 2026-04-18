<?php

namespace App\Modules\Board\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BoardDecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['main-board', 'admin']);
    }

    public function rules(): array
    {
        return [
            'action' => 'required|in:approve,veto,request_info',
            'reason' => 'required_if:action,veto|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
