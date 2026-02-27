import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Bem-vindo" />
            <div className="flex min-h-screen flex-col bg-[#0f172a]">
                <header className="w-full px-6 py-5">
                    <nav className="mx-auto flex max-w-4xl items-center justify-between">
                        <span className="text-lg font-bold text-white">Grupo Six</span>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                                    >
                                        Entrar
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                                        >
                                            Registrar
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="flex flex-1 items-center justify-center px-6 text-center">
                    <div>
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Bem-vindo ao Dashboard do{' '}
                            <span className="text-blue-400">Grupo Six</span>
                        </h1>
                        <p className="mb-8 text-lg text-slate-400">
                            Painel de controle de pedidos, produtos, receitas e reembolsos.
                        </p>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                            >
                                Acessar Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center justify-center gap-4">
                                <Link
                                    href={register()}
                                    className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                                >
                                    Criar Conta
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-lg border border-slate-700 px-8 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
                                >
                                    Entrar
                                </Link>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="py-6 text-center text-xs text-slate-500">
                    Grupo Six
                </footer>
            </div>
        </>
    );
}
