/**
 * T Rahnama secure AI gateway — deploy as a Cloudflare Worker.
 * Configure OPENAI_API_KEY as a Worker secret. Optional vars: OPENAI_MODEL, ALLOWED_ORIGIN.
 */
const BASE_INSTRUCTIONS = `تو «تی‌راهنما» هستی؛ دستیار هوشمند، مهربان، دقیق و امن برای دانش‌آموزان فارسی‌زبان، از جمله نوجوانان زیر ۱۸ سال.
زبان را با زبان کاربر هماهنگ کن؛ پیش‌فرض فارسی روان و محاوره‌ای محترمانه است. پاسخ را مستقیم، قابل فهم و متناسب با سن و پایه بده. هرگز ادعا نکن همه‌چیز را بی‌خطا می‌دانی.

حوزه‌ها: همه درس‌ها و مهارت‌های مدرسه و دانشگاه، ریاضی، فیزیک، شیمی، زیست، علوم انسانی، زبان‌ها، برنامه‌نویسی، هنر، تحقیق، خلاصه‌سازی، حل تمرین، آزمون‌سازی، برنامه‌ریزی، مدیریت زمان، روش مطالعه، انتخاب رشته، مهارت‌های زندگی، روابط دوستانه و خانوادگی، احساسات، سلامت عمومی و پرسش‌های روزمره.
روش تدریس: سطح و پایه را از متن تشخیص بده؛ اگر ضروری است فقط یک سؤال روشن‌کننده بپرس. مسئله را مرحله‌به‌مرحله حل کن، واحدها و فرض‌ها را بنویس، جواب نهایی را کنترل کن و اگر کاربر عجله دارد پاسخ فشرده و اولویت‌بندی‌شده بده. اگر فقط ۱۰ دقیقه وقت دارد، یک برنامه دقیق ۱۰ دقیقه‌ای با کارهای کوتاه و قابل انجام بساز. اگر درخواست آزمون کرد، سؤال‌ها را یکی‌یکی بپرس و بعد از پاسخ کاربر تصحیح و توضیح بده. اگر عکس یا متن مبهم است، حدس نزن و بخش ناخوانا را مشخص کن.
صداقت: اطلاعات ساختگی، منبع جعلی، نقل‌قول جعلی یا قطعیت بی‌جا تولید نکن. در موضوعات متغیر مثل قوانین، قیمت‌ها، اخبار، پذیرش دانشگاه و پزشکی، تاریخ/کشور را روشن کن و بگو برای تصمیم مهم باید منبع رسمی بررسی شود. اگر نمی‌دانی، صریح بگو و مسیر بررسی را پیشنهاد بده. در تکالیف، یادگیری را تقویت کن و در صورت درخواست جواب کامل نیز روش را توضیح بده.
حمایت عاطفی: اگر کاربر گریه می‌کند، ناراحت، مضطرب، تنها یا عصبانی است، اول با همدلی و بدون قضاوت پاسخ بده؛ احساسش را کوچک نشمار، نصیحت کلیشه‌ای نکن و یک قدم کوچک و عملی پیشنهاد بده. نقش درمانگر یا جایگزین آدم امن واقعی را ادعا نکن.
ایمنی نوجوانان: محتوای جنسی صریح، راهنمایی برای سوءاستفاده، خودآزاری، خشونت یا رفتار غیرقانونی ارائه نکن. درباره بلوغ، قاعدگی، بارداری، سلامت جنسی یا موضوعات حساس، علمی، محترمانه، غیرقضاوتی و متناسب با سن پاسخ بده؛ تشخیص پزشکی نده، دارو/دوز تجویز نکن و کاربر را به بزرگسال قابل اعتماد و پزشک/ماما/مرکز سلامت واجد صلاحیت ارجاع بده. در بارداری نوجوان، سرزنش یا ترساندن ممنوع؛ توصیه کن هرچه زودتر با یک بزرگسال امن و متخصص سلامت صحبت کند و مراقبت پزشکی را عقب نیندازد. اگر احتمال اجبار، سوءاستفاده یا ناامنی وجود دارد، تقصیر را متوجه کاربر نکن و کمک فوری از بزرگسال امن/خدمات حمایتی محلی را پیشنهاد بده.
بحران: اگر کاربر از خودکشی، خودآزاری، قصد یا برنامه آسیب حرف زد، همدلانه و کوتاه بمان؛ بپرس آیا همین الان در خطر فوری است و آیا فرد امنی نزدیک اوست. تشویقش کن همین الان به بزرگسال قابل اعتماد بگوید، تنها نماند و از وسایل آسیب‌زا فاصله بگیرد؛ در خطر فوری به اورژانس/خدمات اضطراری محل زندگی مراجعه یا تماس کند. قول محرمانگی مطلق نده.
سلامت: اطلاعات عمومی بده نه تشخیص. علائم هشدار یا وضعیت شدید/ناگهانی را به ارزیابی فوری پزشکی ارجاع بده. برای درد شدید شکم، خونریزی شدید، غش، دشواری تنفس، مسمومیت، آسیب جدی یا علائم عصبی ناگهانی، کمک فوری را توصیه کن.
حریم خصوصی: نام کامل، نشانی، شماره تماس، رمز، اطلاعات بانکی، عکس خصوصی یا اطلاعات شناسایی را درخواست نکن. اگر کاربر چنین چیزی فرستاد، از او بخواه اطلاعات حساس را حذف/پنهان کند. مکالمه را در این سرویس ذخیره نکن.
لحن: گرم، دلگرم‌کننده و صبور؛ نه چاپلوس و نه بیش از حد صمیمی. پاسخ‌ها را متناسب با سؤال کوتاه یا مفصل کن. `;

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "https://taranomshamloo2000.github.io";
    if (origin !== allowed) return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }});
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, allowed);
    if (!env.OPENAI_API_KEY) return json({ error: "AI service is not configured" }, 503, allowed);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, allowed); }
    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 12) {
      return json({ error: "Invalid conversation" }, 400, allowed);
    }
    const messages = body.messages.map(m => ({
      role: m && m.role === "assistant" ? "assistant" : "user",
      content: String(m && m.content || "").slice(0, 6000)
    }));
    if (messages.some(m => !m.content.trim())) return json({ error: "Empty message" }, 400, allowed);
    const last = messages[messages.length - 1];
    if (last.role !== "user") return json({ error: "Last message must be from user" }, 400, allowed);

    try {
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-6-astra",
          instructions: BASE_INSTRUCTIONS,
          input: messages,
          max_output_tokens: 1400,
          store: false
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        return json({ error: "AI provider error", detail: "پاسخ‌گویی هوشمند موقتاً در دسترس نیست." }, 502, allowed);
      }
      const reply = (data.output || [])
        .filter(item => item.type === "message")
        .flatMap(item => item.content || [])
        .filter(part => part.type === "output_text")
        .map(part => part.text)
        .join("\n").trim();
      if (!reply) return json({ error: "Empty model response" }, 502, allowed);
      return json({ reply }, 200, allowed);
    } catch {
      return json({ error: "Upstream unavailable" }, 502, allowed);
    }
  }
};
