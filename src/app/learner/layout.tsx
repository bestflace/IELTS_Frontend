import { LearnerSiteHeader } from '@/components/layout/LearnerSiteHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { RoleGuard } from '@/components/layout/RoleGuard';
export default function Layout({children}:{children:React.ReactNode}){return <RoleGuard allowed={['LEARNER']}><div className="min-h-screen bg-paper"><LearnerSiteHeader/><main className="mx-auto max-w-7xl px-5 py-8">{children}</main><PublicFooter/></div></RoleGuard>}
