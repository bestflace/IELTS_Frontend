import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

const practiceLinks = [
  ["/learner/tests", "Đề thi online"],
  ["/reading-sets", "Reading"],
  ["/listening-sets", "Listening"],
  ["/writing-tasks", "Writing"],
  ["/speaking-sets", "Speaking"],
] as const;

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#052F59] via-[#064E7B] to-[#067D82] text-white">
      <div
        className="ocean-sparkle-layer pointer-events-none absolute inset-0 opacity-35"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#55DFDF]/15 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#6D91F8]/20 blur-[90px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.25fr_0.8fr_0.8fr]">
        <div>
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-white/20 bg-white/95 p-2.5 shadow-[0_16px_45px_rgba(0,33,62,0.18)]"
            aria-label="IELTSBF - Trang chủ"
          >
            <Image
              src="/images/ieltsbf-logo.png"
              alt="IELTSBF"
              width={124}
              height={140}
              className="h-24 w-auto object-contain"
            />
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            Nền tảng luyện thi IELTS 4 kỹ năng, hỗ trợ chấm Writing và Speaking
            bằng AI, kết hợp phản hồi chuyên môn từ giáo viên.
          </p>
          <a
            href="mailto:support@ieltsbf.vn"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            <Mail className="h-4 w-4 text-[#7FEDE8]" />
            support@ieltsbf.vn
          </a>
        </div>

        <div>
          <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-white">
            Luyện tập
          </h4>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            {practiceLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex w-fit items-center gap-1.5 transition hover:text-white"
              >
                {label}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-55" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-white">
            Hệ thống
          </h4>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <Link href="/blogs" className="w-fit transition hover:text-white">
              Bài viết học thuật
            </Link>
            <Link
              href="/auth/login"
              className="w-fit transition hover:text-white"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="w-fit transition hover:text-white"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-5 py-5 text-center text-xs text-white/[0.55]">
        © 2026 IELTSBF. Nền tảng luyện thi IELTS học thuật.
      </div>
    </footer>
  );
}
