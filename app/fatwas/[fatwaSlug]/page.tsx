import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import FatwaDetailContent from "@/components/fatwa/FatwaDetailContent/FatwaDetailContent";
import { fatwas, getFatwa, getRelatedFatwas } from "@/lib/fatwaData";

type Props={params:Promise<{fatwaSlug:string}>};
export function generateStaticParams(){return fatwas.map(item=>({fatwaSlug:item.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {fatwaSlug}=await params;const item=getFatwa(fatwaSlug);return{title:item?.title??"المسائل الحديثية",description:item?.question}}
export default async function FatwaPage({params}:Props){const {fatwaSlug}=await params;const item=getFatwa(fatwaSlug);if(!item)notFound();return <><Header/><main><FatwaDetailContent fatwa={item} related={getRelatedFatwas(item)}/><SectionDivider variant="manuscript"/></main><Footer/></>}
