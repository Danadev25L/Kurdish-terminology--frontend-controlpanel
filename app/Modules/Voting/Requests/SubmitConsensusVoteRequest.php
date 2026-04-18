<?php

namespace App\Modules\Voting\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitConsensusVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('expert');
    }

    public function rules(): array
    {
        return [
            'votes' => 'required|array|min:1',
            'votes.*.candidate_id' => 'required|exists:candidates,id',
            'votes.*.score' => 'nullable|integer|min:1|max:10',
        ];
    }
}
