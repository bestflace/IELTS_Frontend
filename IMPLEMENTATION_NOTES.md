# Implementation Notes

This frontend was adjusted after reading the uploaded backend source.

## API client behavior

- Base URL defaults to `http://localhost:5000/api/v1`.
- Access token is stored in `localStorage` under `ieltsbf_access_token`.
- Refresh endpoint is called with `withCredentials: true`.
- Backend response format is unwrapped automatically:

```ts
{ success: true, message: string, data: T, meta?: ApiMeta }
```

## Auth flow

- Login body: `{ email, password }`.
- Register body: `{ fullName, email, password, confirmPassword }`.
- Reset password body: `{ email, code, newPassword, confirmPassword }`.
- Login redirects:
  - `USER` -> `/learner/dashboard`
  - `TEACHER` -> `/teacher/dashboard`
  - `ADMIN` -> `/admin/dashboard`

## Content banks

The create/update API types use backend validator names:

- Reading: `id`, `title`, `passageHtml`, `passageText`, `level`, `status`, `tagIds`.
- Listening: `id`, `title`, `transcriptText`, `audioUrl`, `audioSource`, `level`, `status`, `tagIds`.
- Writing: `id`, `taskNo`, `title`, `promptText`, `chartUrl`, `imageUrl`, `level`, `status`, `tagIds`.
- Speaking: `id`, `topic`, `level`, `status`, `tagIds`.

## Attempt session

Attempt creation body:

```ts
{ testId, mode, partLabel?, timeLimitSec? }
```

Autosave bodies:

```ts
{ answers: [{ questionId, qNo?, answerJson, isFlagged?, isFinal? }] }
{ responses: [{ writingTaskId, responseText }] }
```

Speaking responses are structured for the R2 upload flow.

## Upload flow

Presign body:

```ts
{ folder, filename, contentType }
```

where folder is one of:

```ts
'speaking-audio' | 'imports' | 'images' | 'avatars' | 'blogs'
```
