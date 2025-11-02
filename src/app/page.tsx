"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const { t } = useTranslation(['common']);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/sign-in");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 gap-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          {t('homeTitle')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {t('homeWelcome')}
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {t('homeDescription')}
        </p>

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/question">{t('browseQuestions')}</Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t('homeFooter')}</p>
      </div>
    </main>
  );
}
