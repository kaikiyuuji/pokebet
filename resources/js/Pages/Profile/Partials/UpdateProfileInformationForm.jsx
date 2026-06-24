import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const avatarInput = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method:  'PATCH',
        name:     user.name,
        username: user.username ?? '',
        email:    user.email,
        bio:      user.bio ?? '',
        avatar:   null,
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-black text-app">Informações do Perfil</h2>
                <p className="mt-1 text-sm text-app-muted">
                    Atualize seu nome, username, e-mail e avatar.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5" encType="multipart/form-data">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <img
                        src={avatarPreview ?? user.avatar_url}
                        alt="Avatar"
                        className="h-16 w-16 object-cover border-2 border-[var(--accent)]"
                    />
                    <div>
                        <button
                            type="button"
                            onClick={() => avatarInput.current?.click()}
                            className="text-sm font-bold text-red-600 hover:text-red-500"
                        >
                            Trocar foto
                        </button>
                        <p className="text-xs text-app-soft mt-0.5">JPG, PNG ou WebP — máx. 2 MB</p>
                        <InputError message={errors.avatar} className="mt-1" />
                    </div>
                    <input
                        ref={avatarInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>

                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value="Nome" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Username */}
                <div>
                    <InputLabel htmlFor="username" value="Username" />
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-app bg-[var(--surface-strong)] px-3 text-app-muted text-sm">
                            @
                        </span>
                        <TextInput
                            id="username"
                            className="block w-full rounded-l-none"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value.toLowerCase())}
                            placeholder="seu_username"
                            autoComplete="off"
                        />
                    </div>
                    <p className="mt-1 text-xs text-app-soft">
                        Letras minúsculas, números e underscores. 3–20 caracteres.
                    </p>
                    <InputError className="mt-1" message={errors.username} />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="E-mail" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Bio */}
                <div>
                    <InputLabel htmlFor="bio" value="Bio" />
                    <textarea
                        id="bio"
                        className="mt-1 block w-full border-app bg-app-surface text-app shadow-none focus:border-[var(--accent)] focus:ring-[var(--accent)] text-sm"
                        rows={3}
                        maxLength={160}
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                    />
                    <p className="text-xs text-app-soft mt-1 text-right">{data.bio.length}/160</p>
                    <InputError className="mt-1" message={errors.bio} />
                </div>

                {/* Email verification notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm text-app-muted">
                            Seu e-mail não foi verificado.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold text-red-600 underline hover:text-red-500"
                            >
                                Reenviar e-mail de verificação.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Um novo link foi enviado para o seu e-mail.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Salvar</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 font-medium">Salvo!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
