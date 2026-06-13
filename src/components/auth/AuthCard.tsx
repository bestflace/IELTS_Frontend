import Image from "next/image";
import Link from "next/link";
import {
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Headphones,
  Mic2,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import styles from "./AuthCard.module.css";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  visual?: "library" | "desk" | "paper" | "typewriter" | "notebook";
  quote?: string;
  sideTitle?: string;
  sideDescription?: string;
};

const skills = [
  { label: "Reading", icon: BookOpenCheck },
  { label: "Listening", icon: Headphones },
  { label: "Writing", icon: PenLine },
  { label: "Speaking", icon: Mic2 },
];

export function AuthCard({
  title,
  subtitle,
  children,
  quote,
  sideTitle = "Chinh phục IELTS theo cách thông minh hơn",
  sideDescription = "Luyện đủ 4 kỹ năng, nhận phản hồi từ Gemini AI và giáo viên trong một hành trình học tập liền mạch.",
}: AuthCardProps) {
  return (
    <main className={styles.shell}>
      <div aria-hidden="true" className={styles.stars} />
      <div aria-hidden="true" className={`${styles.orb} ${styles.orbOne}`} />
      <div aria-hidden="true" className={`${styles.orb} ${styles.orbTwo}`} />
      <div aria-hidden="true" className={`${styles.orb} ${styles.orbThree}`} />

      <section className={styles.card}>
        <aside className={styles.side}>
          <div className="relative z-10 flex min-h-full flex-col justify-between p-9 xl:p-12">
            <Link
              href="/"
              className="inline-flex w-fit items-center rounded-2xl border border-white/20 bg-white/90 px-4 py-2 shadow-xl shadow-blue-950/10 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              aria-label="Về trang chủ IELTSBF"
            >
              <Image
                src="/images/ieltsbf-logo.png"
                alt="IELTSBF"
                width={178}
                height={64}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>

            <div className="my-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-50 backdrop-blur-xl">
                <Sparkles className="h-4 w-4" />
                AI-powered IELTS practice
              </div>

              <h2 className="mt-7 max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-white xl:text-6xl">
                {sideTitle}
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-blue-50/85 xl:text-base">
                {sideDescription}
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                {skills.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.previewCard} rounded-[26px] p-5`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      Phản hồi thông minh
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">
                      Gemini AI + Giáo viên
                    </p>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                    <BrainCircuit className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-5 flex items-end gap-1.5" aria-hidden="true">
                  {[34, 54, 42, 72, 48, 86, 58, 76, 44, 68, 50, 82].map(
                    (height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className={`${styles.waveBar} block w-2 rounded-full bg-gradient-to-t from-cyan-200/55 to-white`}
                        style={{ height }}
                      />
                    ),
                  )}
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-blue-50/90">
                  <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                  {quote ||
                    "Lưu tiến độ, xem lại lỗi sai và cải thiện band điểm mỗi ngày."}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formInner}>
            <div className="mb-9 flex items-center justify-between gap-4 lg:hidden">
              <Link
                href="/"
                className={`${styles.logoShell} inline-flex rounded-2xl border border-white/80 bg-white/80 px-3 py-2 backdrop-blur-xl`}
                aria-label="Về trang chủ IELTSBF"
              >
                <Image
                  src="/images/ieltsbf-logo.png"
                  alt="IELTSBF"
                  width={148}
                  height={52}
                  priority
                  className="h-10 w-auto object-contain"
                />
              </Link>

              <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4" />
                Bảo mật
              </span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              IELTSBF Learning Space
            </div>

            <h1 className="mt-5 bg-gradient-to-r from-sky-950 via-blue-700 to-cyan-500 bg-clip-text text-4xl font-black leading-tight tracking-[-0.035em] text-transparent sm:text-5xl">
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-8">{children}</div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-cyan-500" />
              Thông tin tài khoản được bảo vệ an toàn
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
