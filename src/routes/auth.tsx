import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { absoluteUrl } from "@/lib/site";

const title = "ورود و ثبت‌نام | پارسیان‌یار";
const description = "برای دریافت گزارش کامل کسب‌وکار، ایجاد سازمان، دعوت همکاران و بارگذاری داده مالی، به حساب پارسیان‌یار وارد شوید.";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }], links: [{ rel: "canonical", href: absoluteUrl("/auth") }] }),
  component: AuthPage,
});

function AuthPage() {
  function notReady() {
    toast("احراز هویت در مرحله بعدی فعال می‌شود", { description: "در این فاز، رابط کاربری آماده شده و اتصال امن حساب‌ها در گام بعد انجام می‌شود." });
  }
  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <nav aria-label="مسیر صفحه" className="text-xs text-muted-foreground"><Link to="/" className="hover:text-foreground">خانه</Link>{" / "}<span className="text-foreground">ورود و ثبت‌نام</span></nav>
        <h1 className="mt-4 text-2xl font-extrabold">حساب کاربری پارسیان‌یار</h1>
        <Card className="mt-6 shadow-luxe"><CardHeader><CardTitle className="text-base">خوش آمدید</CardTitle></CardHeader><CardContent>
          <Tabs defaultValue="login"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="login">ورود</TabsTrigger><TabsTrigger value="register">ثبت‌نام</TabsTrigger></TabsList>
          <TabsContent value="login" className="mt-5 grid gap-4"><div className="grid gap-2"><Label htmlFor="login-id">ایمیل یا موبایل</Label><Input id="login-id" placeholder="name@company.ir" /></div><div className="grid gap-2"><Label htmlFor="login-pass">گذرواژه</Label><Input id="login-pass" type="password" placeholder="••••••••" /></div><Button onClick={notReady}>ورود به حساب</Button></TabsContent>
          <TabsContent value="register" className="mt-5 grid gap-4"><div className="grid gap-2"><Label htmlFor="reg-name">نام و نام خانوادگی</Label><Input id="reg-name" placeholder="مثال: سارا محمدی" /></div><div className="grid gap-2"><Label htmlFor="reg-company">نام سازمان</Label><Input id="reg-company" placeholder="مثال: صنایع پارس" /></div><div className="grid gap-2"><Label htmlFor="reg-id">ایمیل یا موبایل</Label><Input id="reg-id" placeholder="name@company.ir" /></div><Button onClick={notReady}>ایجاد حساب و دریافت گزارش کامل</Button></TabsContent></Tabs>
          <p className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-[11px] leading-6 text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />بدون ثبت‌نام هم می‌توانید از <Link to="/trial" className="font-bold text-primary hover:underline">ارزیابی رایگان مهمان</Link> استفاده کنید؛ در آن حالت فقط داده نمونه نمایش داده می‌شود.</p>
        </CardContent></Card>
      </section>
    </SiteLayout>
  );
}
