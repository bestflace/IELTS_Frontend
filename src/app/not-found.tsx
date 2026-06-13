import Link from 'next/link';
import { Button } from '@/components/common/Button';
export default function NotFound(){return <main className='grid min-h-screen place-items-center bg-paper text-center'><div><h1 className='font-serif text-5xl font-bold'>404</h1><p className='mt-2 text-neutralText'>Không tìm thấy trang.</p><Link href='/'><Button className='mt-5'>Về trang chủ</Button></Link></div></main>}
