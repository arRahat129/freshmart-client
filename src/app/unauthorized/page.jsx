import Link from 'next/link';
import { FiShield, FiArrowLeft } from 'react-icons/fi';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl border border-amber-100 shadow-xl p-10 max-w-md w-full text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                    <FiShield size={30} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Your session has expired or you are not logged in.
                        Please sign in to continue.
                    </p>
                </div>
                <Link
                    href="/auth/sign-in"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                    <FiArrowLeft size={15} /> Go to Sign In
                </Link>
            </div>
        </div>
    );
}
