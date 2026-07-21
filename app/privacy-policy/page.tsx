import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import LegalPage from "@/components/legal/LegalPage/LegalPage";
import legal from "@/data/legal.json";
export const metadata:Metadata={title:"سياسة الخصوصية"};
export default function PrivacyPage(){return <><Header/><main><LegalPage content={legal.privacy} type="privacy"/></main><Footer/></>}
