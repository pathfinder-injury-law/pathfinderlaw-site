// Sub-article pages under /virginia-workers-comp-lawyer/. One entry per page; the one template
// (components/SubArticlePage.astro) and the one route (pages/virginia-workers-comp-lawyer/[article].astro)
// do the rest. To add a page: add an entry here and it is built, linked from its siblings, and given
// breadcrumbs and structured data automatically.
//
// Wording is carried over from the live pages (content rework comes later). Rules applied:
//  - No work illness or occupational disease content (the live "occupational diseases" page is NOT
//    built; see the hand-over note).
//  - Outside links removed (SSA, NIH, CDC, MedlinePlus, Mayo, VA, city sites). Kept: the Commission
//    (workcomp.virginia.gov and its conference site) and law.lis.virginia.gov Code links.
//  - Legal statements that also appear on the Workers' Comp page reuse that page's reviewed wording
//    word for word (the constants below).
//  - Live-only legal statements with no reviewed equivalent are kept where the page is about that
//    topic, and listed in the hand-over note for the owner's review.
//
// Text markup: [link text](address) makes a link, {phone} and {contact} make the phone and
// contact-form links. A block is a paragraph (string) or { ul: [...] } for a bulleted list.

export type Block = string | { ul: string[] };
export interface Section {
  h2: string;
  blocks: Block[];
}
export interface SubArticle {
  slug: string;
  title: string; // <title> tag (live title)
  description: string; // meta description (live, singular wording)
  h1: string;
  crumb: string; // short name for the breadcrumb and the "more questions" list
  intro: string[]; // the first paragraph is shown as the larger lead paragraph
  sections: Section[];
  closing: Section; // call-to-action block at the end
}

export const ARTICLE_BASE = '/virginia-workers-comp-lawyer/';

// ---- Reviewed wording, copied exactly from the Workers' Comp page ----
const NOTICE =
  'The Virginia Workers’ Compensation Act requires notice to your employer within thirty days of the accident, although exceptions exist.';
const FILING =
  'A claim must be on file with the Virginia Workers’ Compensation Commission within two years of your date of accident, although exceptions apply.';
const DISPUTE =
  'If you have received a denial of your workers’ comp claim, you have the right to dispute that decision and take your claim to a hearing before the Virginia Workers’ Compensation Commission.';
const MEDICAL =
  'The insurance company is required to pay for medical treatment that is reasonable, necessary, and causally related to your work accident. That doesn’t mean it will.';
const TTD =
  'If a doctor says you cannot return to work at all for a temporary period because of your injuries, you may receive two-thirds of the pre-injury average weekly wage you received during the year immediately prior to your accident, up to a maximum weekly compensation rate.';
const TPD =
  'You may receive benefits to help offset loss of income when your doctor only allows you to return to work with restrictions (often called “light duty”) and you are earning less than you were before you got hurt. The amount paid in these situations is two-thirds of the difference between what you were earning before you got hurt, and what you are earning now that you are injured and working light duty.';
const DEATH =
  'Workers’ comp can provide death benefits to the family of a worker who loses their life because of a workplace injury. These benefits can pay for a limited amount of funeral expenses, medical bills incurred before the death, and lost wages for certain periods of time for certain survivors or dependents who meet statutory criteria.';
const NO_FAULT = 'Workers’ compensation is a form of no-fault insurance coverage.';
const FAULT =
  'Fault generally doesn’t matter in Virginia Workers’ Compensation claims. Even if your own mistake or negligence caused your work injury, you can usually still recover benefits. However, a willful failure to use a safety appliance or perform a statutory duty, or a willful breach of a known, reasonable rule of the employer, can bar recovery. The employer has the burden of proof.';

export const subArticles: SubArticle[] = [
  {
    slug: 'virginia-workers-compensation',
    title: "What You Should Know About Virginia's Workers Compensation",
    description:
      "At Pathfinder Injury Law, we exclusively handle Virginia workers' compensation cases. Check out our online guide to workers' comp benefits.",
    h1: 'Virginia Workers’ Compensation Guide',
    crumb: 'Workers’ Compensation Guide',
    intro: [
      'Hurt in an on-the-job accident in Virginia? You may be eligible for Workers’ Compensation.',
      'One moment, you’re doing your job, just like always. The next, something went wrong, and you were seriously injured. Now, you’re dealing with the pain, the bills, and the inability to work. Worse, you may not have the funds to deal with your injuries.',
      'Here’s what Virginia Workers’ Compensation pays and what to do if it’s denied.',
    ],
    sections: [
      {
        h2: 'Benefits for Injured Virginia Workers',
        blocks: [
          'When you’ve suffered a severe work injury, you need your Workers’ Compensation to cover your needs following the accident. But you may be unsure what benefits you should expect or ask for. Here are the main [Virginia workers’ comp](/virginia-workers-comp-lawyer/) benefits.',
          'Medical benefits. ' + MEDICAL,
          'Disability benefits. Being unable to work can put a financial strain on you and your family. These benefits replace some of the [wages you’ve lost](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-509/) while you are unable to work. ' +
            TTD,
          'Death benefits. ' + DEATH,
        ],
      },
      {
        h2: 'What if My Workers’ Comp Is Denied?',
        blocks: [
          'If you’ve been hurt on the job in Virginia, you may be relieved to know that Workers’ Compensation is available for you. But you may have received a denial letter, not a Workers’ Compensation check.',
          'Luckily, that’s not the end of your claim. You can gather evidence in your favor to [dispute the denial](/virginia-workers-comp-lawyer/what-happens-if-your-workers-comp-claim-is-denied/). For example, the insurance company may claim you weren’t that seriously injured. More tests from your doctor may show you were hurt badly enough that you need Workers’ Compensation. At a hearing before the Commission, a deputy commissioner hears the evidence and decides whether benefits are due.',
        ],
      },
    ],
    closing: {
      h2: 'Hurt on the Job in Virginia?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'what-happens-if-your-workers-comp-claim-is-denied',
    title: "Your Work Comp Claim Was Denied - What To Do Next",
    description:
      "What should you do if your Virginia workers' compensation claim is denied? Explore your options with the trusted Pathfinder Injury Law team.",
    h1: 'What Happens if Your Workers’ Comp Claim Is Denied?',
    crumb: 'If Your Claim Is Denied',
    intro: [
      'If you’ve been hurt on the job, your Workers’ Compensation benefits may be a key part of your recovery. But your employer may not act to help you recover. Instead, your [employer may deny you the benefits](/virginia-workers-comp-lawyer/can-an-employer-deny-a-workers-comp-claim/) you’re due, leaving you with hefty bills and difficulties recovering from your injuries while working.',
      'A denial is not the end of a [Virginia workers’ comp](/virginia-workers-comp-lawyer/) claim. Here’s what happens next.',
    ],
    sections: [
      {
        h2: 'Why Was My Claim Denied?',
        blocks: [
          'Before you take your claim to a hearing, your first step is determining why your [claim was denied](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-601.2/). Your denial letter should include a reason for the denial. That reason is a good first look at what your evidence will have to answer.',
          'Typically, a denial depends on the details of your accident. For example, you may not have had many witnesses who saw the accident. The insurance company may use this lack of evidence against you. Even if others did see your accident, you may be denied in other cases if you didn’t give notice on time. ' +
            NOTICE.replace('within thirty days of the accident', '[within thirty days of the accident](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-600/)'),
        ],
      },
      {
        h2: 'Steps to Getting Your Workers’ Comp Benefits',
        blocks: [
          'Once you know why you were denied, gather evidence that you’re due Workers’ Comp benefits. This evidence can show you were injured, you were actually injured on the job, and you’re unable to work until you’ve healed. Benefits can include [wage replacement](https://workcomp.virginia.gov/documents/injured-workers-benefits-guide), medical bill costs, and death benefits (if a loved one was [killed in a work accident](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-512/)).',
          'But the insurance company may continue denying you the benefits you’re due for the severe injuries you suffered. ' +
            DISPUTE +
            ' Here’s how to [prepare for your work comp hearing](/virginia-workers-comp-lawyer/how-to-prepare-for-a-virginia-workers-comp-hearing/).',
        ],
      },
    ],
    closing: {
      h2: 'Got a Denial Letter?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'can-i-receive-workers-comp-and-social-security-disability-at-the-same-time',
    title: "Can I Receive Workers' Comp & SSD Simultaneously?",
    description:
      "Could you be eligible for both Virginia workers' comp and SSDI benefits? Let's explore your options together at Pathfinder Injury Law.",
    h1: 'Can I Receive Workers’ Comp and Social Security Disability at the Same Time?',
    crumb: 'Workers’ Comp and Social Security Disability',
    intro: [
      'Your Virginia work accident may make it difficult or impossible to work for a long time. You may be worried about the financial strain this puts on your family. You don’t want them to suffer because of your injuries, after all. But how do you get the funds you need to not just pay your medical bills, but to also support yourself and your family?',
      'At Pathfinder Injury Law, we want you to understand the benefits you may be due when you’re hurt in a work accident. Because of this, you may be asking about your options for [seeking out Workers’ Comp benefits](/virginia-workers-comp-lawyer/) and social security disability insurance (SSDI) benefits. Here’s what to know about how the two may work together.',
    ],
    sections: [
      {
        h2: 'Workers’ Comp and Your SSDI Benefits',
        blocks: [
          'Workers’ Comp benefits are offered to support injured workers when their injuries leave them unable to work. SSDI benefits are meant to support those who have suffered a severe, disabling injury, regardless of whether it happened at work. So how do they work together?',
          'Some people may receive both types of benefits, but caution is advised because one can affect the other. Talk with a lawyer about your situation. These benefits are offered through different systems. While these benefits may impact one another, together they can help with the financial strain of an injury.',
        ],
      },
      {
        h2: 'Qualifying for Workers’ Comp',
        blocks: [
          'When qualifying for these programs, getting Workers’ Comp benefits may be simpler. If you’re an employee who qualifies for Workers’ Comp benefits and you’re [hurt on the job](https://workcomp.virginia.gov/documents/injured-workers-benefits-guide), you should be eligible for Workers’ Compensation. But disability benefits may not be so simple.',
        ],
      },
    ],
    closing: {
      h2: 'Seek Help From a Workers’ Comp Lawyer',
      blocks: [
        'Hurt in a work accident and unsure what benefits you qualify for? Your lawyer at Pathfinder Injury Law can talk with you about your options when you’re hurt in a work accident. We even offer free consultations, so reach out for the guidance you need. Call {phone}, or complete the online contact form below.',
      ],
    },
  },

  {
    slug: 'can-an-employer-deny-a-workers-comp-claim',
    title: "Can an Employer Deny a Work Comp Claim?",
    description:
      "Can an employer deny a Virginia workers' comp claim? Common reasons for denials, the notice and filing deadlines, and how to dispute one.",
    h1: 'Can an Employer Deny a Workers’ Comp Claim?',
    crumb: 'Can an Employer Deny a Claim?',
    intro: [
      'When you’re hurt in a serious work accident, [your Workers’ Compensation](/virginia-workers-comp-lawyer/) may be key to your recovery. Your injuries can be difficult to recover from without financial support.',
      'But you may have received a denial, rather than the Workers’ Comp benefits you need for your recovery. Here are some common reasons an employer may deny a Workers’ Comp claim and what happens next.',
    ],
    sections: [
      {
        h2: 'Reasons Employers Deny Workers’ Comp Claims',
        blocks: [
          'When an employer denies your Workers’ Comp claim, you need to know why you were denied before you get started. The reason for the denial is a good first look at what your evidence will have to answer.',
          'For example, your employer may claim you didn’t give notice on time. ' +
            NOTICE.replace('within thirty days of the accident', '[within thirty days of the accident](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-600/)') +
            ' If you don’t act on time, you may be denied your Workers’ Comp benefits. In these cases, the evidence focuses on showing you reported the accident to your employer on time.',
        ],
      },
      {
        h2: 'What to Do After a Denial',
        blocks: [
          'After suffering a work injury, you need work comp benefits as soon as possible, so your [denial](/virginia-workers-comp-lawyer/what-happens-if-your-workers-comp-claim-is-denied/) may be impacting your health and well-being.',
          'Start by finding out why you were denied. If that doesn’t resolve it, [file a claim](https://workcomp.virginia.gov/sites/default/files/documents/Injured-Worker-FAQs_0.pdf) for your benefits. ' +
            FILING,
          'Once you’ve filed your claim, prepare evidence that shows you were hurt and need Workers’ Comp benefits. If the insurance company still won’t pay, you can ask for a hearing before the [Virginia Workers’ Compensation Commission](https://workcomp.virginia.gov/). At the hearing, a deputy commissioner hears the evidence and decides whether benefits are due.',
        ],
      },
    ],
    closing: {
      h2: 'Did Your Employer Deny Your Claim?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'am-i-eligible-for-vocational-rehabilitation',
    title: "Am I Eligible for Vocational Rehabilitation in Virginia?",
    description:
      "Are you eligible for vocational rehabilitation after a Virginia work accident? Explore your options with Pathfinder Injury Law.",
    h1: 'Am I Eligible for Vocational Rehabilitation After an Injury?',
    crumb: 'Vocational Rehabilitation',
    intro: [
      'A serious work accident can bring your career to a halt. You may be worried that you’ll never work again, especially after a traumatic injury like an amputation, as an example.',
      'But what if you’re able to work, just not in your former position? In these situations, you may be eligible for vocational rehabilitation that can help you get back to work. Vocational rehabilitation can be a benefit, but an employer can also use it against you. Here’s how it works under [Virginia workers’ comp](/virginia-workers-comp-lawyer/).',
    ],
    sections: [
      {
        h2: 'What Is Vocational Rehabilitation?',
        blocks: [
          'When you’re hurt at work, you may be unable to return to your job. For example, you may have suffered a brain injury that makes it difficult to focus, which may be a serious problem for your ability to complete your daily tasks.',
          'Vocational rehabilitation helps you find, train for, and get a job that you can complete despite your injuries. Vocational rehabilitation services [offer training services](https://workcomp.virginia.gov/vocational-rehabilitation-guidelines) for those who may be able to work but are unable to return to their former positions.',
        ],
      },
      {
        h2: 'Taking Advantage of Your Workers’ Comp Benefits',
        blocks: [
          'Fortunately, you may be [eligible for these benefits](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/) as part of your Workers’ Comp benefits. Vocational rehabilitation is available to many Virginia workers, who can take advantage of these benefits to build new job skills after a devastating injury.',
          'But it cuts both ways. If you unjustifiably refuse to cooperate with vocational rehabilitation, the insurance company can ask the Commission to suspend your wage benefits until you cooperate, and the checks for that time are not made up later ([Va. Code § 65.2-603(B)](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/)). Job searches, meetings with the vocational counselor, and which jobs count as suitable are frequent points of dispute.',
        ],
      },
    ],
    closing: {
      h2: 'Asked to Meet a Vocational Counselor?',
      blocks: [
        'A serious work injury doesn’t have to end your career. Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'what-is-maximum-medical-improvement-in-virginia-workers-comp-claims',
    title: "What is Maximum Medical Improvement in VA Work Comp Claims?",
    description:
      "Maximum medical improvement is an important consideration for your Virginia workers' comp case. Read more from Pathfinder Injury Law.",
    h1: 'Maximum Medical Improvement in Virginia Workers’ Comp Claims',
    crumb: 'Maximum Medical Improvement',
    intro: [
      'After a work accident, the road to recovery may be long and difficult. You may be concerned about the costs of your losses and the costs of paying your bills while you’re unable to work. Because of this, you need to know what your Workers’ Comp claim may be worth and what maximum medical improvement means in Virginia Workers’ Comp claims.',
      'Here’s what maximum medical improvement means for your [Virginia workers’ comp](/virginia-workers-comp-lawyer/) benefits.',
    ],
    sections: [
      {
        h2: 'What Does Maximum Medical Improvement Mean?',
        blocks: [
          'When you’re hurt in a work accident, you and your doctor will start on the path to your physical recovery as soon as possible. But that can be a long road, and you may not get back to what was normal for you. For example, a brain injury can do permanent cognitive damage. You may have permanent memory loss or a loss of one or more senses, or some fine motor skills may be impacted.',
          'Because your health may never fully recover, maximum medical improvement means you’ve reached the best health you can after the injuries you suffered. You may still need treatment to maintain your health, but you may not be able to improve your health further. In other words, you have reached a plateau.',
        ],
      },
      {
        h2: 'How Maximum Medical Improvement Can Impact Your Workers’ Comp Claim',
        blocks: [
          'Your Workers’ Comp benefits can be impacted if your doctor determines you’ve [reached maximum medical improvement](https://www.workcomp.virginia.gov/documents/injured-workers-benefits-guide). When a doctor determines you have recovered from your injury as much as possible, you may be sent for a battery of physical tests to assess a permanent impairment rating for the affected body parts. If this rating comes back at greater than zero percent and pertains to a body part that is eligible for permanent partial disability benefits, you may be entitled to workers’ comp benefits for the permanent damage you have suffered in that body part. There is a [complex statutory formula](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-503/) that determines how much you will be paid for damage to a body part.',
          'That means you may see some changes to your benefits, and you may feel that you’ve not yet reached maximum medical improvement. If you don’t think you’re done improving, tell your doctor what still limits you so it’s in the records. Which body part the rating is assigned to can change what you’re paid. Here’s [how impairment ratings work](/impairment-rating-virginia-workers-comp/).',
        ],
      },
    ],
    closing: {
      h2: 'Told You’ve Reached Maximum Medical Improvement?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'how-to-prepare-for-an-ime-in-virginia',
    title: "How to Prepare for an IME in Virginia + Helpful Tips",
    description:
      "Pathfinder Injury Law is here to walk you through a workers' comp claim. This is how to prepare for an independent medical exam in Virginia.",
    h1: 'How to Prepare for an IME in Virginia',
    crumb: 'How to Prepare for an IME',
    intro: [
      'After a work accident, you may be expected to take an independent medical exam, or IME. These appointments help the insurance company gauge your injuries and how seriously you suffered. But that means they may be trying to trip you up, tricking you into showing that you’re not really that injured.',
      'Because of this, you need to know how to prepare for an IME in Virginia. Luckily, we at Pathfinder Injury Law have some tips to help you get ready.',
    ],
    sections: [
      {
        h2: 'Bring Someone with You',
        blocks: [
          'You cannot bring friends or family to your IME appointment, but you have the right to have your own doctor present at the exam, at your own expense. These exams are supposed to give insurers a clear medical opinion about your health, and it can impact your insurance. It’s easy to get frustrated or confused without a little help.',
          'That’s where your companion can help. They can help you follow the questions, avoid saying the wrong thing, and keep up with anything you need to know about your injuries.',
        ],
      },
      {
        h2: 'Be Honest',
        blocks: [
          'You want the full settlement you need for your work injuries. Because of this, it may be tempting to stretch the truth on how seriously you were injured. We’re here to tell you that it won’t help you to downplay your injuries; being honest about your accident is crucial to your rightful Virginia Workers’ Comp benefits.',
          'For example, let’s say you suffered a concussion in your work-related accident. You should point out the confusion, memory loss, and fatigue that make your job difficult. But adding on other symptoms you don’t have may do nothing but hurt your claim.',
        ],
      },
      {
        h2: 'Bring Your Medical History',
        blocks: [
          'Your work injury may not be the only thing affecting your overall health. Other health concerns may also be important to your medical exam. For example, if you have a previous concussion, your injuries may have been worse than they would have been without that preexisting condition.',
          'But it can be tough to remember every surgery, diagnosis, and health condition on the spot. Because of this, you and your [Workers’ Comp lawyer](/virginia-workers-comp-lawyer/) in Virginia can review your medical history before your IME to ensure you have all the information you need.',
        ],
      },
    ],
    closing: {
      h2: 'Talk to Your Virginia Work Comp Lawyer Before Your IME',
      blocks: [
        'When you’re hurt in a serious Virginia work accident, attending an IME may be part of your [Workers’ Comp process](/workers-comp-process-in-virginia/). But you may be worried and unsure how to prepare for an IME in Virginia. A mistake could leave you with a denial.',
        'A lawyer at [Pathfinder Injury Law](/) can help you deal with your IME appointment, starting with a free consultation about it. To work with our team, call {phone} or complete the online contact form below.',
      ],
    },
  },

  {
    slug: 'what-happens-after-a-workers-comp-ime-in-virginia',
    title: "What Happens After a Workers’ Comp IME in Virginia?",
    description:
      "After a Virginia workers’ comp IME, the insurer’s doctor writes a report it may use to stop checks or deny treatment. Here’s what happens next.",
    h1: 'What Happens After a Workers’ Comp IME in Virginia?',
    crumb: 'What Happens After an IME',
    intro: [
      'After a workers’ comp IME in Virginia, the doctor the insurance company chose writes a report, and the insurance company uses it to decide what to do next: keep paying, try to stop or reduce your wage checks, deny treatment your own doctor recommended, or argue for a lower impairment rating. The IME doctor does not become your doctor and does not treat you. The report also does not decide anything on its own. If you disagree with it, the Commission decides.',
      'Here is what the report usually covers, what the insurance company can and can’t do with it, and what happens when your doctor disagrees.',
    ],
    sections: [
      {
        h2: 'What Is an IME in Virginia Workers’ Comp?',
        blocks: [
          'An independent medical examination, or IME, is an exam by a doctor the insurance company picks and pays. Virginia law requires you to attend one when your employer asks, at a reasonable time and place. If you refuse to go or get in the way of the exam, your benefits can be suspended until you cooperate, and you may not be paid for that time unless the Commission finds you had a good reason ([Va. Code § 65.2-607](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-607/)). You may bring a qualified doctor of your own to the exam, at your own expense.',
          'The word “independent” is the insurance company’s. Here’s [how to prepare for an IME in Virginia](/virginia-workers-comp-lawyer/how-to-prepare-for-an-ime-in-virginia/).',
        ],
      },
      {
        h2: 'What the IME Report Usually Says',
        blocks: [
          'The IME doctor answers the insurance company’s questions. The report usually gives opinions on:',
          {
            ul: [
              'Whether your condition was caused by the work accident, or is degenerative or pre-existing',
              'Whether you can work, and with what restrictions',
              'Whether treatment your doctor recommends, such as surgery, injections, or therapy, is reasonable and necessary',
              'Whether you have reached [maximum medical improvement](/virginia-workers-comp-lawyer/what-is-maximum-medical-improvement-in-virginia-workers-comp-claims/)',
              'An impairment rating for any permanent loss of use',
            ],
          },
          'The report usually goes to the insurance company first. Commission rules require the insurance company to send you a copy promptly ([16VAC30-50-50(B)](https://law.lis.virginia.gov/admincode/title16/agency30/chapter50/section50/)).',
        ],
      },
      {
        h2: 'What the Insurance Company Can Do With the Report',
        blocks: [
          {
            ul: [
              'Try to stop or reduce your wage checks. Once you have an award, the insurance company can’t just stop paying on its own. It has to file a sworn application with the Commission, backed by the medical reports it relies on, such as the IME report. It generally must pay you through the date it files. If the Commission rejects the application, your checks start again right away. If the Commission accepts it, your checks can stay stopped until the case is decided, and you have 15 days to respond ([Va. Code § 65.2-708](https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/); [16VAC30-50-20(D) and (E)](https://law.lis.virginia.gov/admincode/title16/agency30/chapter50/section20/)).',
              'Refuse to authorize treatment your doctor recommends. You can ask the Commission to order it.',
              'Argue for a lower impairment rating, which means fewer weeks of pay for permanent damage. Here’s [how permanent partial disability is paid](/work-injury-compensation/).',
              'Deny a claim it hasn’t accepted yet. A denial is not the final word. ' + DISPUTE,
              'Use the report to argue for a lower number in settlement talks.',
            ],
          },
        ],
      },
      {
        h2: 'When Your Doctor and the IME Doctor Disagree',
        blocks: [
          'When the doctors disagree, the Commission weighs the medical evidence. In Virginia, the opinion of your treating physician is generally given great weight, because that doctor has seen you over time (Vital Link, Inc. v. Hope, 69 Va. App. 43, 64 (2018)). That is not automatic. The Commission can accept the IME doctor’s opinion if it finds it more persuasive, and a short or unexplained note from your own doctor can lose to a detailed IME report.',
          'That is why what your treating doctor writes after an IME often matters more than the IME itself. A response that deals with the IME doctor’s reasons point by point carries more weight than a one-line disagreement, and doctors rarely write one unless someone asks the right questions.',
        ],
      },
      {
        h2: 'What to Do After the IME',
        blocks: [
          {
            ul: [
              'Write down, the same day, how long the exam lasted, what the doctor examined and asked, and anything said that you disagree with.',
              'Ask for a copy of the report.',
              'Keep going to your own doctor and follow your treatment plan and work restrictions.',
              'Show the IME report to your treating doctor.',
              'Watch your mail for a letter from the insurance company or a notice that it filed an application with the Commission. Deadlines run from those.',
            ],
          },
          'If the insurance company denies treatment or stops checks, here’s [what to do when the insurer delays your benefits](/what-if-a-workers-comp-insurer-delays-my-benefits/) and [how to prepare for a Virginia workers’ comp hearing](/virginia-workers-comp-lawyer/how-to-prepare-for-a-virginia-workers-comp-hearing/).',
        ],
      },
    ],
    closing: {
      h2: 'Is an IME Being Used Against You?',
      blocks: [
        'An IME report is often the first step toward stopped checks, a denied surgery, or a lower rating. What happens next turns on medical evidence, Commission procedure, and deadlines that start running when the insurance company acts. [Pathfinder Injury Law](/) handles only Virginia workers’ compensation claims. Call {phone} or use the {contact} on this page.',
      ],
    },
  },

  {
    slug: 'how-to-calculate-a-virginia-workers-comp-settlement',
    title: "How is a Virginia Workers' Comp Settlement Determined?",
    description:
      "What a Virginia workers' comp settlement has to account for: future medical care, wage loss, permanent loss of use, and Medicare.",
    h1: 'How to Calculate a Virginia Workers’ Comp Settlement',
    crumb: 'How to Calculate a Settlement',
    intro: [
      'When you’ve suffered a work injury, you may need financial aid that covers your losses. The problem is, you don’t know how to calculate a Virginia Workers’ Comp settlement. You may have no experience, and your injuries may be sapping any time and energy you had for learning about Workers’ Comp law.',
      'Here’s what a [Virginia work injury](/virginia-work-injury-lawyer/) settlement has to account for. The amount has to account for future medical care and lost earning power, because after a full and final settlement you cannot come back for more.',
      'A settlement is optional. Nobody can force you to settle. Settlement ends the benefits it covers, and the Commission must approve all settlements.',
    ],
    sections: [
      {
        h2: 'Adding Up Your Medical Costs',
        blocks: [
          'First, you need those medical bills covered, fast. They add up when you’re hurt, and you may need treatment for months or even years after your work accident. For injuries like spinal cord damage, you may face lifelong consequences for the work accident.',
          'Virginia workers can get their medical bills covered by Workers’ Comp. ' +
            MEDICAL +
            ' A full and final settlement closes your medical benefits for good, so future care for the injury has to be part of the number.',
        ],
      },
      {
        h2: 'Your Virginia Disability Benefits',
        blocks: [
          'Your Virginia Workers’ Comp covers more than your hospital bills. Workers’ comp can also pay part of your wages when you’re unable to work.',
          'These benefits cover a [portion of your weekly income](https://workcomp.virginia.gov/documents/injured-workers-benefits-guide). The amount and duration of the benefits you receive will depend on the type of injury you suffered and whether you’re able to return to work in any capacity.',
        ],
      },
      {
        h2: 'Permanent Loss of Use and Medicare',
        blocks: [
          'If your doctor has rated a permanent loss of use, the permanent partial disability benefits for that rating are part of what a full and final settlement closes. Here’s [how impairment ratings work](/impairment-rating-virginia-workers-comp/).',
          'If you are on Medicare, or likely to be within 30 months, Medicare’s interests have to be considered, and part of the money may need to go into a [Medicare set-aside](/workers-comp-settlement-in-virginia/#medicare).',
        ],
      },
    ],
    closing: {
      h2: 'Have a Settlement Offer on the Table?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'what-does-workers-comp-cover-in-virginia',
    title: "What Does Workers' Compensation Cover After an Injury",
    description:
      "Virginia workers' compensation may cover medical bills, disability benefits, and death benefits. Read more from Pathfinder Injury Law.",
    h1: 'What Does Workers’ Comp Cover in Virginia?',
    crumb: 'What Workers’ Comp Covers',
    intro: [
      'After a serious work injury, you could be in a tough financial position. You’re hurt, you need funds to support yourself, and you’re unable to work. You may be eligible for a Workers’ Comp claim, but what does Workers’ Comp cover in Virginia?',
      'Here’s what Virginia workers’ comp pays for, and what it doesn’t.',
    ],
    sections: [
      {
        h2: 'Medical Bills',
        blocks: [
          'After a serious work injury, you shouldn’t have to pay for your medical care yourself. Your employer must offer a panel of at least three doctors, and you choose one. If your claim is denied, you can generally choose your own doctor instead. ' + MEDICAL,
          'Medical benefits can include travel to medical appointments, too. For example, you may have to travel out of your town to see a specialist about your injury, and workers’ comp can reimburse mileage for travel to and from medical appointments.',
        ],
      },
      {
        h2: 'Disability Benefits',
        blocks: [
          'You may be unable to work, but that doesn’t mean you can get by without an income. You still need some wage replacement benefits to cover your daily expenses and needs.',
          'Disability benefits replace part of your wages, not all of them. ' + TTD,
          TPD,
        ],
      },
      {
        h2: 'Death Benefits',
        blocks: [DEATH],
      },
      {
        h2: 'What Workers’ Comp Doesn’t Cover',
        blocks: [
          'Workers’ comp does not pay for pain and suffering. It pays for specific things: medical care, part of your lost wages, and permanent loss of use of certain body parts. Here’s [how impairment ratings work](/impairment-rating-virginia-workers-comp/).',
        ],
      },
    ],
    closing: {
      h2: 'Questions About What Your Claim Covers?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'how-to-prepare-for-a-virginia-workers-comp-hearing',
    title: 'How to Prepare for a Virginia Workers’ Comp Hearing',
    description:
      'How to prepare for a Virginia workers’ comp hearing: what the deputy commissioner decides, the evidence that matters, testifying, and what comes after.',
    h1: 'How to Prepare for a Virginia Workers’ Comp Hearing',
    crumb: 'Hearing Preparation',
    intro: [
      'A Virginia workers’ comp hearing is a trial before a deputy commissioner of the Virginia Workers’ Compensation Commission, and you have to prove your claim by a preponderance of the evidence. Most hearings are won or lost on the medical records, a doctor’s written opinion on what caused the injury, and whether your testimony matches what you told everyone before. Preparing means knowing exactly what the insurance company is disputing and lining up the evidence that answers it.',
      'You can ask the Commission for a hearing whenever there’s a dispute, not only after a denial. Here’s how to get ready.',
    ],
    sections: [
      {
        h2: 'What Happens at a Workers’ Comp Hearing?',
        blocks: [
          'At the hearing, a deputy commissioner hears the evidence and decides whether benefits are due. You testify under oath, your lawyer asks you questions, and the insurance company’s lawyer cross-examines you. Other witnesses, such as a coworker or a supervisor, may testify too.',
          'Doctors rarely come to the hearing. Their opinions usually come in through medical records, written reports, and answers to written questions, and sometimes through a deposition taken before the hearing. That’s why getting a clear written opinion from your doctor is often the most important step.',
          'The deputy commissioner usually doesn’t decide on the spot. A written opinion comes later.',
        ],
      },
      {
        h2: 'Start with What the Insurance Company Is Disputing',
        blocks: [
          'Every hearing is about specific issues. Before you gather anything, pin down which ones are in play. A few of the many defenses insurance companies raise:',
          {
            ul: [
              'No accident. The insurance company says there was no specific incident, only pain that came on over time.',
              'Not work related. It says the accident didn’t arise out of your job, or the injury came from something else.',
              'Pre-existing condition. It says your problem was there before the accident. Here’s more on [pre-existing conditions](/pre-existing-conditions-and-workers-comp-claims/).',
              'Late notice. It says you didn’t tell your employer within 30 days.',
              'Refused work or treatment. It says you turned down light duty or medical care that was offered.',
              'The wage. It agrees you’re hurt but figures your average weekly wage too low, which shrinks every check.',
            ],
          },
          'The denial letter, the insurance company’s filings with the Commission, and its answers to written questions tell you which of these you’re facing.',
        ],
      },
      {
        h2: 'Get the Medical Evidence in Writing',
        blocks: [
          'Medical records show what the doctor saw. They often don’t say, in so many words, that the work accident caused the injury, that the treatment is necessary, or that you can’t work. Those are the questions the deputy commissioner has to answer, so you want your doctor’s answers in writing.',
          'Check your records for the history you gave. If the first urgent care note says your shoulder “has hurt for a while,” or leaves out a body part, expect the insurance company to build its case on it. If the insurance company sent you to its own doctor for an independent medical exam, expect that report to be its main evidence. Here’s [what happens after an IME](/virginia-workers-comp-lawyer/what-happens-after-a-workers-comp-ime-in-virginia/).',
        ],
      },
      {
        h2: 'Line Up Witnesses and Documents',
        blocks: [
          {
            ul: [
              'Coworkers or supervisors who saw the accident, or saw you right after it',
              'The accident report and any written notice you gave your employer',
              'Photos of the place it happened, the equipment, or the injury',
              'Pay stubs or wage records for the 52 weeks before the accident, which set your average weekly wage',
              'A job description showing what your work required',
              'Records of every job you applied for, if you’re on restrictions and looking for work',
            ],
          },
          'Before the hearing, each side can send written questions and document requests and take depositions. Here’s [how to prepare for a workers’ comp deposition](/how-to-prepare-for-a-workers-comp-deposition/).',
        ],
      },
      {
        h2: 'Prepare to Testify',
        blocks: [
          'The insurance company’s lawyer will compare what you say at the hearing with your recorded statement, your deposition, the accident report, and the history in your medical records. Differences, even innocent ones, are what it uses to argue you aren’t credible.',
          'Before the hearing, reread all of those. Be ready to explain exactly what you were doing when you got hurt, every body part that hurt, when you first saw a doctor, and any earlier problems with the same body part. Answer the question asked, and don’t guess. If you don’t know or don’t remember, say so.',
        ],
      },
      {
        h2: 'Mediation Before the Hearing',
        blocks: [
          'The Commission offers mediation, where the two sides try to settle the dispute before the hearing. A deputy commissioner acts as the mediator, and the deputy commissioner who mediates your case is not the one who decides it. Here’s more on [how to settle a Virginia workers’ comp dispute](/virginia-work-injury-lawyer/how-to-settle-a-virginia-workers-comp-dispute/).',
        ],
      },
      {
        h2: 'What Happens After the Hearing?',
        blocks: [
          'The deputy commissioner issues a written opinion. Either side may request review of the deputy commissioner’s decision by the full Commission within thirty days of the date the opinion is issued. The Full Commission’s decision can be appealed to the Court of Appeals of Virginia, and the Supreme Court of Virginia is over both.',
          'Here’s [how to appeal a workers’ comp denial in Virginia](/how-to-appeal-a-workers-comp-denial-in-virginia/).',
        ],
      },
    ],
    closing: {
      h2: 'Have a Hearing Coming Up?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    slug: 'does-virginia-workers-comp-pay-for-lost-wages',
    title: "Does Virginia Workers’ Comp Pay for Lost Wages?",
    description:
      "Can you get workers' comp for lost wages after a work accident? Here's what Pathfinder Injury Law wants you to know. Call 804-505-0633.",
    h1: 'Does Virginia Workers’ Comp Pay for Lost Wages?',
    crumb: 'Does Workers’ Comp Pay Lost Wages?',
    intro: [
      'After a serious work injury in Virginia, you may be directed to your Workers’ Comp benefits to recover from your injuries. You can’t cover your bills and needs without your wages, so it’s vital that you get coverage.',
      'But does Virginia Workers’ Comp pay for lost wages? Yes, in part. Here’s how wage benefits work.',
    ],
    sections: [
      {
        h2: 'Your Virginia Wage Replacement Benefits',
        blocks: [
          'When you’re hurt on the job in Virginia, you may be due benefits that cover your losses for a work accident. You may expect coverage for your medical bills, from specialist care to travel costs. But what about your wages?',
          'Disability benefits replace a portion of the wages you would have received. Although you won’t receive your full paycheck, these funds can help keep you and your family supported and fed while you heal from your injuries.',
          'If the insurance company accepts your claim for lost wages, it sends you an Award Agreement. Once that is signed and the Commission enters an award, you are paid for the time you are unable to work because of the injury, starting on day 8.',
        ],
      },
      {
        h2: 'How Much Do Wage Checks Pay?',
        blocks: [
          'The funds you receive depend on your original wages and the severity of your injuries. For example, if you’re unable to work in any capacity, you may be eligible for total disability benefits. ' + TTD,
          'But let’s say you injured your back at work. You may be unable to perform all your usual tasks at work, but you’re able to work to some degree. In these cases, you may receive wages for the work you’re able to do, as well as partial disability benefits. ' +
            TPD,
          'Wondering about taxes on these checks? Read [Are Workers’ Comp benefits taxable?](/are-workers-comp-benefits-taxable/)',
        ],
      },
    ],
    closing: {
      h2: 'Not Getting Your Wage Checks?',
      blocks: [
        'Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call {phone} or fill out the [form on this page](#contact).',
      ],
    },
  },

  {
    // Rewritten Nov 9, 2026 (schedule #8): 683 impressions at position 17.8 on a thin page, plus
    // "average workers comp settlement for [knee, meniscus, ACL, hip labrum]" searches (Search
    // Console). Bryn's rule: no ranges or averages; his approved first-call quote. Law check: file 54d.
    slug: 'average-workers-comp-settlement-in-virginia',
    title: 'Average Workers’ Comp Settlement in Virginia: Honest Answer',
    description:
      'There is no useful average Virginia workers’ comp settlement. Here’s what actually sets the number: your wage, your rating, future medical care, and the risk.',
    h1: 'What Is the Average Workers’ Comp Settlement in Virginia?',
    crumb: 'Average Settlement',
    intro: [
      'There is no average workers’ comp settlement in Virginia that will tell you what your claim is worth. A settlement is built from your own numbers: your average weekly wage, how many weeks of benefits are left, any permanent rating, the cost of your future medical care, and how strong the insurance company thinks its defenses are. Two workers with the same torn meniscus can have settlements far apart, because those numbers are different.',
      'So this page doesn’t give a number. It shows what goes into one, so you can see which parts of your claim move it.',
      'A settlement is optional. Nobody can force you to settle. Settlement ends the benefits it covers, and the Commission must approve all settlements ([Va. Code § 65.2-701](https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-701/)).',
    ],
    sections: [
      {
        h2: 'Why Averages Online Don’t Fit Your Claim',
        blocks: [
          'Settlement averages you find online usually mix claims that have little in common: a sprain with two weeks out of work and a spinal fusion with no return to work, claims from other states with different rules, and medical-only claims with no lost wages at all. An average of those tells you nothing about yours.',
          'Virginia sets its own rules for what comp pays. Wage checks are two-thirds of your average weekly wage, up to a weekly maximum that is set each July 1. For injuries on or after July 1, 2026, the maximum is $1,507.01 a week ([Commission rates](https://www.workcomp.virginia.gov/documents/rates-min-max-benefits-cola-mileage); [Va. Code § 65.2-500](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-500/)). Permanent ratings are paid from Virginia’s own schedule of weeks for each body part ([Va. Code § 65.2-503](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-503/)). Virginia workers’ comp does not pay for pain and suffering, so a settlement doesn’t either.',
          '“On the first call, I won’t guess what your case is worth. I don’t know anything about it yet. Any lawyer who puts a number on it that early is making it up.” (Bryn Swartz)',
        ],
      },
      {
        h2: 'What Actually Sets a Virginia Settlement',
        blocks: [
          'A settlement trades benefits you could receive in the future for money now. These are the pieces that set how much those future benefits are worth:',
          {
            ul: [
              'Your compensation rate: two-thirds of your average weekly wage, which is generally your total earnings, including overtime pay, from the job where you got hurt during the 52 weeks before the injury, divided by 52. When that method would be unfair, for example because you worked there only a short time, the Commission can use another one ([Va. Code § 65.2-101](https://law.lis.virginia.gov/vacode/title65.2/chapter1/section65.2-101/)). A mistake in that number shrinks every check and every settlement built on them.',
              'How many weeks of wage benefits are left: total compensation for an injury is generally capped at 500 weeks, with exceptions such as permanent and total incapacity, so weeks already paid come off what is left to settle ([Va. Code § 65.2-518](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-518/)).',
              'Whether you can work, and at what pay: someone back at full duty at the same wage has less future wage loss to settle than someone who can’t go back.',
              'Your permanent rating: a 20 percent loss of use of a leg is 20 percent of 175 weeks, or 35 weeks of pay at your compensation rate ([Va. Code § 65.2-503](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-503/)). A few points on a rating can mean weeks of benefits.',
              'Future medical care: most Virginia settlements are full and final, which closes medical care for good, so the cost of future visits, medication, injections, and surgery has to be part of the number.',
              'Medicare: if you are on Medicare, or have a reasonable expectation of being on it within 30 months, Medicare’s interest in future medical care has to be considered, and part of the money may need to go into a [Medicare set-aside](/workers-comp-settlement-in-virginia/#medicare). Not every settlement has one.',
              'The risk on each side: if the insurer has a real defense, such as a question about whether the accident happened at work, that lowers what it will pay. If the claim is accepted and the evidence is strong, the insurer’s risk is higher.',
              'The attorney’s fee, if you have a lawyer: in a Virginia comp case, the Commission must approve it ([Va. Code § 65.2-714](https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-714/)).',
            ],
          },
          'Here’s [how a Virginia workers’ comp settlement is calculated](/virginia-workers-comp-lawyer/how-to-calculate-a-virginia-workers-comp-settlement/), step by step.',
        ],
      },
      {
        h2: 'What About the Average Settlement for a Knee, Back, or Shoulder?',
        blocks: [
          'The body part matters less than people expect. What matters is what the injury did: whether it needed surgery, how long it kept you out of work, the permanent rating, and the care you still need. A torn meniscus that heals after surgery and a torn meniscus that leads to a knee replacement are different claims. Each of these pages explains what drives value for that injury:',
          {
            ul: [
              '[Knee injuries](/knee-injury-compensation/), including meniscus and ACL tears',
              '[Back injuries](/virginia-workers-comp-lawyer/virginia-back-injury-lawyer/) and [herniated discs](/herniated-disc-workers-comp/)',
              '[Neck injuries](/neck-injury-workers-comp/) and [spine injuries](/what-should-you-do-if-you-have-a-spine-injury-at-work/)',
              '[Shoulder injuries](/shoulder-injury-workers-comp/)',
              '[Hip injuries](/hurt-your-hip-at-work/), including labral tears',
              '[Ankle injuries](/ankle-injury-workers-comp/), [foot injuries](/foot-injury-workers-comp/), and [Achilles tendon ruptures](/achilles-tendon-rupture-workers-comp/)',
              '[Concussions and brain injuries](/concussion-brain-injury-workers-comp/)',
              '[CRPS and spinal cord stimulators](/crps-spinal-cord-stimulator-workers-comp/)',
            ],
          },
        ],
      },
      {
        h2: 'When Is the Right Time to Settle?',
        blocks: [
          'Usually not until you know what the injury will cost you. Before you reach [maximum medical improvement](/virginia-workers-comp-lawyer/what-is-maximum-medical-improvement-in-virginia-workers-comp-claims/), there is often no permanent rating and no clear picture of future care, and both are pieces of the number. An offer that comes early can look large next to a missed paycheck and still leave out years of medical care.',
          'Once the Commission approves a full and final settlement, you cannot come back for more, even if the injury gets worse. Here’s more on [whether to accept a lump-sum settlement](/should-i-accept-a-lump-sum-settlement-for-my-workers-comp-claim/) and on [workers’ comp settlements in Virginia](/workers-comp-settlement-in-virginia/).',
        ],
      },
    ],
    closing: {
      h2: 'Have a Settlement Offer on the Table?',
      blocks: [
        '[Pathfinder Injury Law](/) handles only Virginia workers’ compensation claims. Call {phone} or use the {contact} on this page.',
      ],
    },
  },

  {
    slug: 'how-is-workers-comp-calculated-in-virginia',
    title: "How Are Workers’ Comp Benefits Calculated in Virginia?",
    description:
      "How is workers’ comp calculated in Virginia? Pathfinder Injury Law has what you need to know for your work injury case.",
    h1: 'How Are Workers’ Comp Benefits Calculated in Virginia?',
    crumb: 'How Benefits Are Calculated',
    intro: [
      'After a serious work accident, you may need Workers’ Comp to cover your expenses. But how is Workers’ Comp calculated in Virginia? That can be tough to answer without the right tools.',
      'Luckily, Pathfinder Injury Law has what you need to understand your [Workers’ Comp benefits](/virginia-workers-comp-lawyer/). If you’re not sure what your claim is worth, talk to your lawyer about your benefits and the other details you may need below.',
    ],
    sections: [
      {
        h2: 'Your Capacity to Work',
        blocks: [
          'First, the Workers’ Comp you receive will depend on whether you’re able to work at all. For example, you may have broken your leg in a Virginia work accident. You may be unable to perform all the necessary duties for your original job. But you can sit at a desk, making you able to do some work after all.',
          'In these cases, you may receive both a paycheck and benefits that cover a portion of the difference between that paycheck and your original income. ' + TPD,
          'If you’re unable to work at all, your benefits will be based on your wages before the accident. ' + TTD,
        ],
      },
      {
        h2: 'How Long You’re Unable to Work',
        blocks: [
          'Sometimes, your injuries will only take a few weeks or months to clear up or heal. For example, you may have a burn injury from your work accident, but it may not leave lasting damage. In these cases, your Virginia Workers’ Comp benefits may continue while you’re unable to work.',
          'But what if your injuries are so severe you’re [permanently injured](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-503/) and unable to work? In these situations, you may be eligible for permanent disability benefits.',
        ],
      },
    ],
    closing: {
      h2: 'Know Your Claim’s Value with Help From a Virginia Workers’ Comp Lawyer',
      blocks: [
        'Injured in a Virginia work accident and unsure how to get compensated for your related losses? Reach out to a dedicated lawyer at [Pathfinder Injury Law](/). We can help you understand the potential value of your benefits. To start with a free consultation, call {phone} or fill out the online contact form below.',
      ],
    },
  },

  {
    slug: 'how-long-do-virginia-workers-comp-settlements-take',
    title: "How Long Does a Workers' Comp Settlement Take in Virginia?",
    description:
      "The trusted team at Pathfinder Injury Law will guide you through the Virginia workers' compensation claim process. Read more on our website.",
    h1: 'How Long Do Virginia Workers’ Comp Settlements Take?',
    crumb: 'How Long Settlements Take',
    intro: [
      'After a serious injury at work, it can be tough to wait for your Workers’ Comp benefits to arrive. You may be worried about how long your Virginia Workers’ Comp settlement will take, especially as your medical bills and other debts pile up.',
      'Here’s the good news: a lawyer from Pathfinder Injury Law may be able to help you understand the process. If you’re struggling to overcome your injuries following a work accident, take a look at how you can get your benefits as soon as possible and how a [Workers’ Comp lawyer in Virginia](/virginia-workers-comp-lawyer/) can help.',
      'A settlement is optional. Nobody can force you to settle. Settlement ends the benefits it covers, and the Commission must approve all settlements.',
    ],
    sections: [
      {
        h2: 'Filing Your Claim Quickly',
        blocks: [
          'After a work accident, you need to report your injuries to your employer and request your Workers’ Comp benefits as soon as possible. ' + NOTICE + ' ' + FILING,
          'If you were hurt at work, see a doctor promptly, even if the injury seems minor. Delayed injuries may not be obvious right away, and it can hurt your claim if the insurance company thinks you weren’t injured in the accident. Getting looked at as soon as possible helps erase those doubts.',
        ],
      },
      {
        h2: 'Getting Compensated Isn’t Always Simple',
        blocks: [
          'You may have thought you did everything right and on time, so your Workers’ Comp benefits should arrive soon, right? But you may have instead received a denial letter, leaving you without funds for your needs, like utilities and groceries.',
          'That means it may take a little longer to get your Virginia Workers’ Comp settlement, but that doesn’t mean you’re out of luck. Your Workers’ Comp lawyer can look into why you were denied compensation before your Workers’ Comp hearing. They can also represent you at a hearing before the Commission to dispute that decision as soon as possible.',
        ],
      },
    ],
    closing: {
      h2: 'Get Your Benefits Soon with a Virginia Work Comp Lawyer',
      blocks: [
        'After you’re injured in a work accident, there’s no single answer for how long your Virginia Workers’ Comp settlement will take. You may already be worried about how you’ll cover your family expenses in the meantime and pay off those bills.',
        'At [Pathfinder Injury Law](/), we’re ready to help with your Workers’ Comp claim as soon as possible. That’s why we offer free consultations with a Workers’ Comp lawyer in Virginia. If you’re struggling to settle your Workers’ Comp claim quickly, call {phone} or fill out the {contact} below.',
      ],
    },
  },

  {
    slug: 'when-does-virginia-workers-comp-start-paying',
    title: "When Does Workers’ Comp Start Paying? Virginia’s 7-Day Rule",
    description:
      "Virginia workers’ comp wage checks start on day 8 of missed work, and the first 7 days are paid back if you’re out more than 3 weeks. Here’s the timeline.",
    h1: 'When Does Virginia Workers’ Comp Start Paying?',
    crumb: 'When Benefits Start',
    intro: [
      'In Virginia, workers’ comp wage checks do not cover the first seven days you are out of work. Pay starts on the eighth day. If you are out more than three weeks, the insurance company must go back and pay those first seven days too ([Va. Code § 65.2-509](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-509/)). Medical treatment is different: it is covered from the first day.',
      'When the first check actually arrives depends on whether the insurance company accepts your claim. Here is how the timing works, what the checks pay, and what to do if they are late or never come.',
    ],
    sections: [
      {
        h2: 'Virginia’s 7-Day Waiting Period, Day by Day',
        blocks: [
          {
            ul: [
              'Days 1 to 7 out of work: no wage checks. Your medical treatment is still covered.',
              'Day 8 on: wage checks start.',
              'Out more than three weeks: wage checks are paid back to day 1.',
            ],
          },
          'The count is calendar days you are unable to work because of the injury, not just workdays ([Va. Code § 65.2-509](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-509/)).',
        ],
      },
      {
        h2: 'How Much Do the Checks Pay?',
        blocks: [
          TTD + ' The maximum is tied by law to Virginia’s average weekly wage and changes every July 1, so the one that applies to you depends on your date of injury. For injuries on or after July 1, 2026, the maximum is $1,507.01 a week and the minimum is $376.75 ([Commission rates](https://www.workcomp.virginia.gov/documents/rates-min-max-benefits-cola-mileage); [Va. Code § 65.2-500](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-500/)). Here’s [how Virginia workers’ comp benefits are calculated](/virginia-workers-comp-lawyer/how-is-workers-comp-calculated-in-virginia/).',
          TPD,
        ],
      },
      {
        h2: 'What Has to Happen Before the First Check',
        blocks: [
          {
            ul: [
              'Tell your employer about the accident in writing. ' + NOTICE,
              'Your employer or its insurance company must report the injury to the Commission within 10 days after learning of it ([Va. Code § 65.2-900](https://law.lis.virginia.gov/vacode/title65.2/chapter9/section65.2-900/)).',
              'File a claim with the Commission, even if the insurance company accepts your injury and starts paying. ' + FILING + ' A filed claim protects that deadline if anything goes wrong later. Here’s [how to file a workers’ comp claim](/how-to-file-a-workers-comp-claim/).',
              'After you file, the Commission will order the insurance company to respond to your claim within 30 days. It may accept the claim or deny it.',
              'If the insurance company accepts your claim for lost wages, it sends you an Award Agreement. Once that is signed and the Commission enters an award, you are paid for the time you are unable to work because of the injury, starting on day 8.',
            ],
          },
          'Be careful what you say to the [insurance adjuster](/how-to-avoid-work-comp-adjusters-tricks/), and do not assume they are looking out for you. Here’s [what to know before giving a recorded statement](/insurance-recorded-statement/).',
        ],
      },
      {
        h2: 'What If a Check Is Late?',
        blocks: [
          'Virginia law adds a penalty when the insurance company is late. If a payment is not made within two weeks after it becomes due, the law adds 20 percent to the unpaid amount, unless the Commission finds the delay had good cause outside the employer’s control ([Va. Code § 65.2-524](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-524/)).',
          'If your checks have stopped or are slow, here’s [what to do when the insurance company delays your benefits](/what-if-a-workers-comp-insurer-delays-my-benefits/).',
        ],
      },
      {
        h2: 'What If Your Claim Is Denied?',
        blocks: [
          'If the insurance company denies your claim, it will not pay wage checks unless the Commission orders it to or the claim is resolved another way. ' + DISPUTE + ' You can ask the Commission for a hearing no matter what the insurance company decides.',
          'Here’s [what happens if your workers’ comp claim is denied](/virginia-workers-comp-lawyer/what-happens-if-your-workers-comp-claim-is-denied/).',
        ],
      },
    ],
    closing: {
      h2: 'Checks Late, Stopped, or Never Started?',
      blocks: [
        'Late or missing checks usually mean a dispute is building: over whether the injury is covered, what your average weekly wage really was, or whether you can do light duty. Each of those turns on medical records, pay records, and deadlines that keep running while you wait. [Pathfinder Injury Law](/) handles only Virginia workers’ compensation claims. Call {phone} or use the {contact} on this page.',
      ],
    },
  },

  {
    slug: 'if-i-get-injured-at-work-in-virginia-do-i-get-paid',
    title: "Do You Get Paid If You’re Hurt at Work in Virginia?",
    description:
      "Yes, if the injury is covered. Virginia workers’ comp pays two-thirds of your average weekly wage, up to $1,507.01 a week, starting on day 8.",
    h1: 'If I Get Injured at Work in Virginia, Do I Get Paid?',
    crumb: 'Do I Get Paid If Injured at Work?',
    intro: [
      'Yes, if your injury is covered by Virginia workers’ compensation, but not your regular paycheck. While a doctor says you can’t work, workers’ comp pays two-thirds of your average weekly wage, up to a weekly maximum: $1,507.01 for injuries on or after July 1, 2026 ([Va. Code § 65.2-500](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-500/)). Checks start on the eighth day out of work, and the first seven days are paid back if you are out more than three weeks ([Va. Code § 65.2-509](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-509/)). Your employer’s workers’ comp insurance company pays (or your employer pays directly, if it is self-insured) ([Va. Code § 65.2-801](https://law.lis.virginia.gov/vacode/title65.2/chapter8/section65.2-801/)), and treatment for the injury is covered too.',
      'Whether you actually get paid, and when, depends on whether the accident qualifies, whether the insurance company accepts the claim, and how your wage is figured. Here’s how each works.',
    ],
    sections: [
      {
        h2: 'What Workers’ Comp Pays',
        blocks: [
          {
            ul: [
              'Out of work completely (temporary total disability): two-thirds of your average weekly wage, up to the weekly maximum ([Va. Code § 65.2-500](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-500/)).',
              'Back at work on light duty for less pay (temporary partial disability): two-thirds of the difference between what you earned before and what you earn now ([Va. Code § 65.2-502](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-502/)).',
              'Permanent damage (permanent partial disability): a set number of weeks of pay for permanent loss of use of certain body parts ([Va. Code § 65.2-503](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-503/)). Here’s [what a work injury is worth in Virginia](/work-injury-compensation/).',
              'Medical treatment: care that is reasonable, necessary, and causally related to the accident, from the first day ([Va. Code § 65.2-603](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/)).',
            ],
          },
          'Your average weekly wage is generally your total earnings, including overtime pay, from the job where you got hurt during the 52 weeks before the injury, divided by 52 ([Va. Code § 65.2-101](https://law.lis.virginia.gov/vacode/title65.2/chapter1/section65.2-101/)). Mistakes in that number shrink every check. Here’s [how Virginia workers’ comp benefits are calculated](/virginia-workers-comp-lawyer/how-is-workers-comp-calculated-in-virginia/).',
        ],
      },
      {
        h2: 'Does My Employer Have to Keep Paying My Salary?',
        blocks: [
          'No. Virginia workers’ comp replaces part of your wages through the insurance company’s checks; it does not require your employer to keep paying your regular salary while you are out. Some employers keep paying for a while or let you use sick leave or vacation. Keep a record of every payment you get from your employer while you are out. If your employer paid you money that workers’ comp did not owe yet, the Commission can let the insurance company take it back, but usually only by holding back up to one-fourth of each weekly check ([Va. Code § 65.2-520](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-520/)).',
        ],
      },
      {
        h2: 'Does My Injury Qualify?',
        blocks: [
          'Getting paid starts with whether the accident is covered. The injury must arise out of and in the course of your job, and it must be caused by an accident: an identifiable incident at a reasonably definite time that causes a sudden mechanical or structural change in your body. You must also be an employee, not a true independent contractor. Here’s [how to qualify for workers’ comp in Virginia](/how-to-qualify-for-workers-comp-in-virginia/) and [what to do if your employer calls you an independent contractor](/what-to-do-when-your-employer-lists-you-as-an-independent-contractor/).',
          FAULT,
        ],
      },
      {
        h2: 'What Has to Happen Before You Get Paid',
        blocks: [
          {
            ul: [
              'Tell your employer about the accident in writing. ' + NOTICE,
              'File a claim with the Commission, even if the insurance company accepts your injury and starts paying. ' + FILING + ' A filed claim protects that deadline if anything goes wrong later. Here’s [how to file a workers’ comp claim](/how-to-file-a-workers-comp-claim/).',
              'After you file, the Commission will order the insurance company to respond to your claim within 30 days. It may accept the claim or deny it.',
              'If it accepts, it sends you an Award Agreement. Once that is signed and the Commission enters an award, you are paid for the time you can’t work because of the injury.',
            ],
          },
          'Be careful what you say to the [insurance adjuster](/how-to-avoid-work-comp-adjusters-tricks/), and do not assume they are looking out for you. Here’s [what to know before giving a recorded statement](/insurance-recorded-statement/) and [when Virginia workers’ comp starts paying](/virginia-workers-comp-lawyer/when-does-virginia-workers-comp-start-paying/).',
        ],
      },
      {
        h2: 'What If the Insurance Company Won’t Pay?',
        blocks: [
          'The insurance company is required to pay a covered claim, but that doesn’t mean it will. ' + DISPUTE + ' You can ask the Commission for a hearing no matter what the insurance company decides. If a payment is not made within two weeks after it becomes due, the law adds 20 percent to the unpaid amount, unless the Commission finds the delay had good cause ([Va. Code § 65.2-524](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-524/)).',
          'Here’s [what happens if your claim is denied](/virginia-workers-comp-lawyer/what-happens-if-your-workers-comp-claim-is-denied/) and [what to do when the insurer delays your benefits](/what-if-a-workers-comp-insurer-delays-my-benefits/).',
        ],
      },
    ],
    closing: {
      h2: 'Hurt at Work and Not Getting Paid?',
      blocks: [
        'Most payment problems come down to whether the accident qualifies, what your average weekly wage really was, or whether you can do light duty. Each one turns on medical records, pay records, and deadlines that keep running while you wait. [Pathfinder Injury Law](/) handles only Virginia workers’ compensation claims. Call {phone} or use the {contact} on this page.',
      ],
    },
  },
];
