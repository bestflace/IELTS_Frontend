import Link from 'next/link';
import { Button } from '@/components/common/Button';
export default function Page(){return <main className='grid min-h-screen place-items-center bg-paper text-center'><div><h1 className='font-serif text-4xl font-bold'>Forbidden</h1><p className='mt-2 text-neutralText'>Bạn không có quyền truy cập trang này.</p><Link href='/'><Button className='mt-5'>Về trang chủ</Button></Link></div></main>}
