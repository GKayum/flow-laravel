<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => [
                'file',
                'mimetypes:image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-rar-compressed,text/plain'
            ],
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->hasFile('files') && empty($this->input('content'))) {
            $this->merge(['content' => null]);
        }
    }
}
