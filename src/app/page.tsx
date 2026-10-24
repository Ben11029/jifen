import Link from "next/link";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import BoardGameScorer from "@/components/boardgame-scorer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let user = null;
  try {
    user = await getCurrentUser(await headers());
  } catch {
    // 数据库未连接或配置中时的优雅降级
    user = null;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      {/* 顶部控制与登录导航栏 */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 shadow-xs backdrop-blur-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎲</span>
            <div>
              <h1 className="text-xl font-black text-teal-900 tracking-tight">
                桌游计分器
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                展仪翱翔 (Wingspan) + 国家公园 2 (PARKS 2)
              </p>
            </div>
          </div>

          {/* 用户认证状态与操作区 */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-full py-1 px-3">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "Avatar"}
                    className="size-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">
                    {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="text-sm font-semibold text-stone-700 max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
                <Link
                  href="/account"
                  className="rounded-full bg-stone-200 hover:bg-stone-300 px-3 py-1 text-xs font-medium text-stone-800 transition-colors"
                >
                  账户
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-800 px-4 py-1.5 text-sm font-bold text-white shadow-xs transition-colors"
                >
                  <span>🔑</span>
                  <span>登录 (Google / 邮箱)</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主体计分板区域 */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
        <BoardGameScorer />
      </main>

      {/* 页面底部 */}
      <footer className="mt-12 border-t border-stone-200 bg-white py-8 text-center text-xs text-stone-500">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4">
          <p className="font-medium text-stone-600">🎲 祝您游戏愉快！随时记录每一局的精彩时刻。</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link href="/login" className="hover:text-teal-700 underline">
              登录中心
            </Link>
            <Link href="/account" className="hover:text-teal-700 underline">
              个人账户
            </Link>
            <Link href="/privacy" className="hover:text-teal-700 underline">
              隐私条款
            </Link>
            <Link href="/api/health" className="hover:text-teal-700 underline">
              服务状态
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
