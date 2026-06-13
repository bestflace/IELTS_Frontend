import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Headphones,
  Mic,
  PenLine,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Users,
} from "lucide-react";

const skills = [
  {
    name: "Reading",
    icon: BookOpen,
    href: "/reading-sets",
    desc: "Luyện passage, matching headings, T/F/NG và review đáp án theo từng câu.",
    card: "from-[#E8FBFF] via-white to-[#DFF8FF]",
    iconStyle: "bg-[#DDF8FF] text-[#0575C8]",
  },
  {
    name: "Listening",
    icon: Headphones,
    href: "/listening-sets",
    desc: "Audio player, answer sheet, transcript và autosave trong suốt quá trình làm bài.",
    card: "from-[#EAF6FF] via-white to-[#E4EDFF]",
    iconStyle: "bg-[#E3EEFF] text-[#245FD6]",
  },
  {
    name: "Writing",
    icon: PenLine,
    href: "/writing-tasks",
    desc: "Viết Task 1/2, đếm từ tự động và nhận feedback AI theo rubric IELTS.",
    card: "from-[#E6FFFC] via-white to-[#DDFBF7]",
    iconStyle: "bg-[#DBFAF5] text-[#079C9A]",
  },
  {
    name: "Speaking",
    icon: Mic,
    href: "/speaking-sets",
    desc: "Luyện Part 1/2/3, ghi âm, xem transcript và nhận đánh giá chi tiết.",
    card: "from-[#EEF0FF] via-white to-[#E4F5FF]",
    iconStyle: "bg-[#E7ECFF] text-[#4F55D8]",
  },
];

const stats = [
  ["10,000+", "Lượt luyện tập"],
  ["50+", "Bộ đề chuẩn hóa"],
  ["4 kỹ năng", "Trong một nền tảng"],
  ["24/7", "AI hỗ trợ phản hồi"],
];

const steps = [
  [
    "01",
    "Chọn lộ trình",
    "Lọc đề theo kỹ năng, trình độ và mục tiêu band điểm.",
  ],
  [
    "02",
    "Làm bài như thi thật",
    "Timer, autosave và điều hướng câu hỏi giúp luyện tập sát kỳ thi.",
  ],
  [
    "03",
    "Cải thiện có định hướng",
    "Xem lỗi sai, điểm số và feedback AI/giáo viên sau từng lần luyện.",
  ],
];

const feedbackRows = [
  ["Task Response", "7.0", "Luận điểm rõ, cần phát triển ví dụ sâu hơn."],
  ["Coherence & Cohesion", "7.5", "Bố cục tốt, liên kết đoạn tự nhiên."],
  ["Lexical Resource", "6.5", "Từ vựng đa dạng, còn lặp từ ở phần kết."],
  ["Grammar", "7.0", "Câu phức tốt, còn một số lỗi nhỏ."],
];

export function LandingPage() {
  return (
    <main className="ocean-landing overflow-hidden text-oceanInk">
      <section className="ocean-hero relative isolate overflow-hidden">
        <div
          className="ocean-sparkle-layer pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div
          className="ocean-orb ocean-orb-one pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="ocean-orb ocean-orb-two pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="ocean-orb ocean-orb-three pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="relative z-10">
            <div className="ocean-hero-enter ocean-delay-1 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/[0.55] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0868AD] shadow-[0_12px_40px_rgba(18,121,185,0.14)] backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-[#10AFC2]" />
              Nền tảng luyện IELTS ứng dụng AI
            </div>

            <h1 className="ocean-hero-enter ocean-delay-2 mt-7 max-w-4xl font-serif text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-oceanInk md:text-7xl xl:text-[5.2rem]">
              Nâng band điểm với một lộ trình
              <span className="ocean-gradient-text block pb-2">
                rõ ràng và thông minh.
              </span>
            </h1>

            <p className="ocean-hero-enter ocean-delay-3 mt-6 max-w-2xl text-base leading-8 text-[#47677F] md:text-lg">
              IELTSBF kết hợp trải nghiệm làm bài sát kỳ thi thật, phản hồi AI
              cho Writing & Speaking và đánh giá từ giáo viên để mỗi lần luyện
              đều tạo ra tiến bộ có thể đo lường.
            </p>

            <div className="ocean-hero-enter ocean-delay-4 mt-9 flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="ocean-primary-button group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold text-white"
              >
                Bắt đầu luyện miễn phí
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/learner/tests"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-6 text-sm font-bold text-[#075C9B] shadow-[0_12px_35px_rgba(36,122,177,0.10)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.85]"
              >
                <PlayCircle className="h-4 w-4" />
                Xem đề thi online
              </Link>
            </div>

            <div className="ocean-hero-enter ocean-delay-5 mt-10 grid gap-3 text-sm text-[#45677F] sm:grid-cols-3">
              {[
                "Mô phỏng thi thật",
                "AI + giáo viên phản hồi",
                "Theo dõi tiến độ",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#08A6A7]" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[620px] lg:mx-0">
            <div className="ocean-float-slow absolute -left-5 top-8 z-20 hidden rounded-3xl border border-white/80 bg-white/70 p-3 shadow-[0_20px_60px_rgba(31,114,176,0.18)] backdrop-blur-2xl sm:block">
              <Image
                src="/images/ieltsbf-mark.png"
                alt="Biểu tượng IELTSBF"
                width={76}
                height={76}
                className="h-16 w-16 object-contain"
                priority
              />
            </div>

            <div className="ocean-float-medium absolute -right-3 -top-6 z-20 hidden items-center gap-3 rounded-2xl border border-white/75 bg-white/70 px-4 py-3 shadow-[0_20px_60px_rgba(29,118,181,0.16)] backdrop-blur-2xl sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0DB8B2] to-[#1872DD] text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6D8AA0]">
                  AI Feedback
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#073F70]">
                  Sẵn sàng trong vài giây
                </p>
              </div>
            </div>

            <div className="ocean-hero-enter ocean-delay-3 ocean-glass ocean-shine relative overflow-hidden rounded-[2rem] p-3 shadow-[0_36px_100px_rgba(23,105,169,0.22)] sm:p-5">
              <div className="rounded-[1.6rem] border border-white/80 bg-white/80 p-4 backdrop-blur-2xl sm:p-5">
                <div className="flex items-center justify-between gap-4 border-b border-[#CFEAF6] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0DACE0] to-[#165ACB] text-white shadow-[0_12px_30px_rgba(22,90,203,0.24)]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7390A5]">
                        IELTS Reading Practice
                      </p>
                      <h3 className="font-serif text-xl font-bold text-[#083D68]">
                        Urban Farming
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#CAE8F5] bg-[#F5FDFF] px-3 py-2 text-sm font-bold text-[#075C9B]">
                    <Timer className="h-4 w-4 text-[#09A9AE]" />
                    59:42
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr]">
                  <article className="relative overflow-hidden rounded-2xl border border-[#D6EDF7] bg-gradient-to-b from-white to-[#F3FBFF] p-5">
                    <div
                      className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#82E9F1]/20 blur-3xl"
                      aria-hidden="true"
                    />
                    <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A9DA8]">
                      Academic Reading
                    </p>
                    <h4 className="relative mt-2 font-serif text-2xl font-bold text-[#093E6B]">
                      Urban Farming
                    </h4>
                    <p className="relative mt-4 text-sm leading-7 text-[#5E7B91]">
                      In Paris, empty rooftops are becoming productive gardens.
                      A quiet revolution has taken root above modern cities.
                    </p>
                    <p className="relative mt-3 text-sm leading-7 text-[#5E7B91]">
                      Local farming can shorten supply chains and reduce the
                      urban heat island effect.
                    </p>
                    <div className="relative mt-5 flex gap-2">
                      {["A", "B", "C"].map((item, index) => (
                        <span
                          key={item}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${index === 1 ? "bg-gradient-to-br from-[#0EBBB5] to-[#1B72D7] text-white shadow-[0_8px_20px_rgba(27,114,215,0.24)]" : "border border-[#D2EAF5] bg-white text-[#66859A]"}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </article>

                  <aside className="space-y-3 rounded-2xl border border-[#D6EDF7] bg-[#F7FDFF] p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-serif text-lg font-bold text-[#083D68]">
                        Questions
                      </p>
                      <span className="rounded-full bg-[#DDF8F5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#058F91]">
                        Đã lưu
                      </span>
                    </div>
                    {[
                      "Multiple choice",
                      "Short answer",
                      "Matching headings",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="rounded-xl border border-[#D8EDF6] bg-white p-3 shadow-[0_8px_24px_rgba(32,112,164,0.06)]"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-[#214E6E]">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E2F7FB] text-[#0877B4]">
                            {index + 1}
                          </span>
                          {item}
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-[#E7F3F8]" />
                        <div className="mt-2 h-2 w-2/3 rounded-full bg-[#E7F3F8]" />
                      </div>
                    ))}
                  </aside>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ["24/40", "Câu đã làm"],
                    ["Auto", "Lưu bài"],
                    ["AI", "Phân tích"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[#D7EEF7] bg-white/80 p-3 text-center"
                    >
                      <p className="text-sm font-extrabold text-[#0869AA]">
                        {value}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#7992A5]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ocean-float-fast absolute -bottom-8 left-10 z-20 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-[0_20px_60px_rgba(29,118,181,0.16)] backdrop-blur-2xl sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3FAF8] text-[#069B9E]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#7B94A5]">
                  Tiến độ tuần
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#083E6A]">
                  Tăng 18%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="ocean-wave-divider absolute inset-x-0 bottom-0 h-20"
          aria-hidden="true"
        />
      </section>

      <section className="relative -mt-1 bg-white">
        <div className="ocean-reveal mx-auto max-w-7xl px-5 py-10">
          <div className="grid overflow-hidden rounded-[1.7rem] border border-[#D9EDF6] bg-white shadow-[0_24px_70px_rgba(37,116,164,0.10)] sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([value, label], index) => (
              <div
                key={value}
                className={`px-5 py-7 text-center ${index < 3 ? "lg:border-r lg:border-[#DCEFF7]" : ""} ${index < 2 ? "sm:border-b lg:border-b-0" : ""}`}
              >
                <div className="font-serif text-3xl font-bold text-[#075D9C]">
                  {value}
                </div>
                <div className="mt-2 text-sm text-[#688398]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white px-5 py-20 sm:py-24">
        <div
          className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-[#A7F1F2]/25 blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#AFCBFF]/25 blur-[90px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="ocean-reveal mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#079DA6]">
              Luyện tập toàn diện
            </p>
            <h2 className="mt-4 font-serif text-4xl font-bold tracking-[-0.025em] text-[#063B65] md:text-5xl">
              Một nền tảng cho cả 4 kỹ năng IELTS
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#668298]">
              Mỗi kỹ năng có trải nghiệm luyện tập riêng, nhưng cùng hội tụ
              trong một lộ trình học tập thống nhất.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {skills.map(({ name, icon: Icon, desc, href, card, iconStyle }) => (
              <Link
                key={name}
                href={href}
                className={`ocean-reveal ocean-card-lift group relative overflow-hidden rounded-[1.7rem] border border-[#D8EDF6] bg-gradient-to-br ${card} p-6 shadow-[0_18px_55px_rgba(31,111,164,0.08)]`}
              >
                <div
                  className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-white/80 bg-white/[0.35] transition-transform duration-500 group-hover:scale-125"
                  aria-hidden="true"
                />
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_10px_35px_rgba(5,117,200,0.12)] ${iconStyle}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="relative mt-6 font-serif text-2xl font-bold text-[#073E69]">
                  {name}
                </h3>
                <p className="relative mt-3 min-h-[5.2rem] text-sm leading-6 text-[#638096]">
                  {desc}
                </p>
                <div className="relative mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#0877B4]">
                  Luyện ngay
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F3FBFF] px-5 py-20 sm:py-24">
        <div
          className="ocean-sparkle-layer pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="ocean-reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CDEAF5] bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0875B4] shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-[#09A8AD]" />
              Gemini AI + giáo viên
            </div>
            <h2 className="mt-6 max-w-xl font-serif text-4xl font-bold leading-tight tracking-[-0.03em] text-[#063B65] md:text-5xl">
              Phản hồi không chỉ có điểm số, mà còn chỉ rõ cách tiến bộ.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#638096]">
              Writing và Speaking được phân tích theo từng tiêu chí IELTS. Giáo
              viên có thể review lại, bổ sung nhận xét và giúp học viên hiểu vì
              sao mình đang ở band hiện tại.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#D6EDF6] bg-white/75 p-4 shadow-[0_14px_40px_rgba(30,108,158,0.07)] backdrop-blur-xl">
                <ShieldCheck className="h-5 w-5 text-[#089EA5]" />
                <p className="mt-3 text-sm font-extrabold text-[#0A456F]">
                  Rubric chuẩn IELTS
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6A8497]">
                  Điểm và nhận xét được tách theo từng tiêu chí.
                </p>
              </div>
              <div className="rounded-2xl border border-[#D6EDF6] bg-white/75 p-4 shadow-[0_14px_40px_rgba(30,108,158,0.07)] backdrop-blur-xl">
                <Users className="h-5 w-5 text-[#089EA5]" />
                <p className="mt-3 text-sm font-extrabold text-[#0A456F]">
                  AI kết hợp giáo viên
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6A8497]">
                  Phản hồi nhanh nhưng vẫn có đánh giá chuyên môn.
                </p>
              </div>
              <div className="rounded-2xl border border-[#D6EDF6] bg-white/75 p-4 shadow-[0_14px_40px_rgba(30,108,158,0.07)] backdrop-blur-xl">
                <BarChart3 className="h-5 w-5 text-[#089EA5]" />
                <p className="mt-3 text-sm font-extrabold text-[#0A456F]">
                  Theo dõi tiến bộ
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6A8497]">
                  Nhìn thấy xu hướng điểm số sau từng lần luyện.
                </p>
              </div>
              <div className="rounded-2xl border border-[#D6EDF6] bg-white/75 p-4 shadow-[0_14px_40px_rgba(30,108,158,0.07)] backdrop-blur-xl">
                <Timer className="h-5 w-5 text-[#089EA5]" />
                <p className="mt-3 text-sm font-extrabold text-[#0A456F]">
                  Phản hồi nhanh
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6A8497]">
                  Giảm thời gian chờ và duy trì nhịp học liên tục.
                </p>
              </div>
            </div>
          </div>

          <div className="ocean-reveal relative">
            <div
              className="absolute -inset-8 rounded-full bg-gradient-to-br from-[#8DECEF]/20 to-[#8EB7FF]/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="ocean-glass ocean-shine relative rounded-[2rem] p-4 shadow-[0_30px_90px_rgba(26,105,161,0.16)] sm:p-6">
              <div className="rounded-[1.5rem] border border-white/[0.85] bg-white/[0.85] p-5 backdrop-blur-2xl sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D7EDF6] pb-5">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7793A7]">
                      Writing Task 2 Analysis
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-[#073E69]">
                      Estimated Band 7.0
                    </h3>
                  </div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(#0CB5B0_0_70%,#DDEFF5_70%_100%)] shadow-[0_12px_35px_rgba(12,181,176,0.18)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-extrabold text-[#0875B4]">
                      7.0
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {feedbackRows.map(([label, score, desc], index) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[#D9EDF6] bg-gradient-to-r from-white to-[#F4FBFF] p-4 shadow-[0_8px_26px_rgba(30,108,158,0.05)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-extrabold text-[#164D71]">
                          {label}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${index === 1 ? "bg-[#DDF8F5] text-[#078F92]" : "bg-[#E5F1FF] text-[#1764B8]"}`}
                        >
                          {score}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#6A8396]">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#CDEAF5] bg-gradient-to-r from-[#E9FBFC] to-[#EEF5FF] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0CB5B0] to-[#1769D0] text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-6 text-[#476B84]">
                    <strong className="text-[#0B4B77]">Gợi ý ưu tiên:</strong>{" "}
                    phát triển ví dụ cụ thể hơn và giảm lặp từ ở phần kết luận.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="ocean-reveal mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#079DA6]">
              Lộ trình đơn giản
            </p>
            <h2 className="mt-4 font-serif text-4xl font-bold tracking-[-0.025em] text-[#063B65] md:text-5xl">
              Từ chọn đề đến cải thiện band điểm
            </h2>
          </div>

          <div className="relative grid gap-5 md:grid-cols-3">
            <div
              className="absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-[#8FD6E7] to-transparent md:block"
              aria-hidden="true"
            />
            {steps.map(([number, title, desc]) => (
              <div
                key={number}
                className="ocean-reveal ocean-card-lift relative rounded-[1.7rem] border border-[#D8EDF6] bg-gradient-to-b from-white to-[#F5FCFF] p-7 text-center shadow-[0_18px_55px_rgba(31,111,164,0.08)]"
              >
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-gradient-to-br from-[#0BB6B1] to-[#176BD2] font-serif text-xl font-bold text-white shadow-[0_14px_35px_rgba(23,107,210,0.25)]">
                  {number}
                </div>
                <h3 className="mt-6 font-serif text-2xl font-bold text-[#073E69]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#668298]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#073D70] via-[#075F9D] to-[#079B9D] px-5 py-20 text-white sm:py-24">
        <div
          className="ocean-sparkle-layer pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#6AE8E8]/20 blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#7BA8FF]/25 blur-[100px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="ocean-reveal">
            <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#A4F4F1]">
              Học viên nói gì
            </p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
              Một không gian học tập sáng rõ và tập trung hơn.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
              Giao diện trực quan, dữ liệu tiến độ rõ ràng và feedback có chiều
              sâu giúp việc luyện IELTS bớt mơ hồ hơn.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#8AF0EC]" />
                Cộng đồng học viên tích cực
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-[#FFE9A6] text-[#FFE9A6]" />
                Trải nghiệm học tập thân thiện
              </div>
            </div>
          </div>

          <div className="ocean-reveal grid gap-4 sm:grid-cols-2">
            {[
              [
                "Minh Trí",
                "Overall Band 7.0",
                "Giao diện làm bài rõ ràng, dễ tập trung. Phần review giúp mình biết chính xác lỗi cần sửa sau mỗi lần luyện.",
              ],
              [
                "Linh Nguyễn",
                "Writing Band 6.5",
                "Feedback theo từng tiêu chí rất dễ hiểu. Mình nhìn được điểm yếu thay vì chỉ nhận một con số chung chung.",
              ],
              [
                "Hoàng An",
                "Speaking Band 7.0",
                "Phần ghi âm và transcript giúp mình nhận ra lỗi nói lặp và cải thiện fluency rõ rệt.",
              ],
            ].map(([name, band, quote], index) => (
              <div
                key={name}
                className={`rounded-[1.6rem] border border-white/20 bg-white/10 p-6 shadow-[0_22px_65px_rgba(2,37,72,0.18)] backdrop-blur-2xl ${index === 2 ? "sm:col-span-2 sm:mx-auto sm:max-w-[70%]" : ""}`}
              >
                <div className="flex gap-1 text-[#FFE9A6]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm italic leading-7 text-white/80">
                  “{quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/[0.15] font-serif font-bold text-white">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{name}</div>
                    <div className="text-xs text-white/[0.65]">{band}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-5 pb-24 pt-20 sm:pb-28 sm:pt-24">
        <div className="ocean-reveal relative mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-[#075B9D] via-[#087FAD] to-[#08AAA8] px-6 py-14 text-center text-white shadow-[0_35px_100px_rgba(18,112,168,0.24)] sm:px-12 sm:py-16">
          <div
            className="ocean-sparkle-layer pointer-events-none absolute inset-0 opacity-65"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#72E7E5]/25 blur-[70px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#85A9FF]/25 blur-[80px]"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl">
            <Image
              src="/images/ieltsbf-mark.png"
              alt="IELTSBF"
              width={86}
              height={86}
              className="mx-auto h-20 w-20 object-contain drop-shadow-[0_12px_28px_rgba(0,40,80,0.22)]"
            />
            <h2 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
              Sẵn sàng bắt đầu một buổi luyện IELTS hiệu quả hơn?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/80">
              Tạo tài khoản để lưu tiến độ, xem kết quả và nhận phản hồi sau mỗi
              bài làm.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-extrabold text-[#07669E] shadow-[0_14px_35px_rgba(0,47,82,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,47,82,0.24)]"
              >
                Đăng ký miễn phí
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/50 bg-white/10 px-6 text-sm font-extrabold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
