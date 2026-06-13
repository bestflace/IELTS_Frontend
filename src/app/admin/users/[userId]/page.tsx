import { UserDetailPage } from "@/components/users/UserDetailPage";

export default function Page({ params }: { params: { userId: string } }) {
  return <UserDetailPage userId={params.userId} />;
}
