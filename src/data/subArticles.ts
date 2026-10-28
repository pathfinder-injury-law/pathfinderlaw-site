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
  'The Virginia Workers’ Compensation Act requires you to give notice to your employer within thirty days of the injury.';
const FILING =
  'A claim must be on file with the Virginia Workers’ Compensation Commission within two years of your date of accident, although exceptions apply.';
const DISPUTE =
  'If you have received a denial of your workers’ comp claim, you have the right to dispute that decision and take your claim to a hearing before the Virginia Workers’ Compensation Commission.';
const MEDICAL =
  'Your workers’ comp medical benefits should cover all of your medical bills and related costs for medical treatment that is reasonable, necessary, and causally related to your work accident.';
const TTD =
  'If a doctor says you cannot return to work at all for a temporary period because of your injuries, you may receive two-thirds of the pre-injury average weekly wage you received during the year immediately prior to your accident, up to a maximum weekly compensation rate.';
const TPD =
  'You may receive benefits to help offset loss of income when your doctor only allows you to return to work with restrictions (often called “light duty”) and you are earning less than you were before you got hurt. The amount paid in these situations is two-thirds of the difference between what you were earning before you got hurt, and what you are earning now that you are injured and working light duty.';
const DEATH =
  'Workers’ comp can provide death benefits to the family of a worker who loses their life because of a workplace injury. These benefits can pay for a limited amount of funeral expenses, medical bills incurred before the death, and lost wages for certain periods of time for certain survivors or dependents who meet statutory criteria.';
const NO_FAULT = 'Workers’ compensation is a form of no-fault insurance coverage.';
const FAULT =
  'Fault generally doesn’t matter in Virginia Workers’ Compensation claims. Even if your own mistake or negligence caused your work injury, you can usually still recover benefits. However, breaking safety rules or breaking statutes can bar recovery.';

export const subArticles: SubArticle[] = [
  {
    slug: 'virginia-workers-compensation',
    title: "What You Should Know About Virginia's Workers Compensation",
    description:
      "At Pathfinder Injury Law, we exclusively handle Virginia workers' compensation cases. Check out our online guide to workers' comp benefits.",
    h1: 'Virginia Workers’ Compensation Guide',
    crumb: 'Workers’ Compensation Guide',
    intro: [
      'Hurt in an on-the-job accident in Virginia? You may be eligible for Workers’ Compensation. Reach out to a lawyer who can help you seek the Workers’ Comp benefits you need.',
      'One moment, you’re doing your job, just like always. The next, something went wrong, and you were seriously injured. Now, you’re dealing with the pain, the bills, and the inability to work. Worse, you may not have the funds to deal with your injuries.',
      'Luckily, you have a chance to get Virginia Workers’ Compensation. Pathfinder Injury Law is here to help you seek the benefits you may be due when you’re hurt on the job.',
    ],
    sections: [
      {
        h2: 'Benefits for Injured Virginia Workers',
        blocks: [
          'When you’ve suffered a severe work injury, you need your Workers’ Compensation to cover your needs following the accident. But you may be unsure what benefits you should expect or ask for. Here are a few benefits your [Workers’ Compensation lawyer in Virginia](/virginia-workers-comp-lawyer/) can help you seek.',
          'Medical benefits. ' + MEDICAL,
          'Disability benefits. Being unable to work can put a financial strain on you and your family. Your lawyer can help you seek disability benefits to ease that strain. These benefits replace some of the [wages you’ve lost](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-509/) while you are unable to work. ' +
            TTD,
          'Death benefits. ' + DEATH,
        ],
      },
      {
        h2: 'What if My Workers’ Comp Is Denied?',
        blocks: [
          'If you’ve been hurt on the job in Virginia, you may be relieved to know that Workers’ Compensation is available for you. But you may have received a denial letter, not a Workers’ Compensation check.',
          'Luckily, that’s not the end of your claim. Your Workers’ Comp lawyer can help you gather evidence in your favor to [dispute the denial](/virginia-workers-comp-lawyer/what-happens-if-your-workers-comp-claim-is-denied/). For example, the insurance company may claim you weren’t that seriously injured. More tests from your doctor may show you were hurt badly enough that you need Workers’ Compensation. Your lawyer can also represent you in a hearing for your Workers’ Compensation.',
        ],
      },
    ],
    closing: {
      h2: 'Connect with a Virginia Lawyer for Your Workers’ Compensation Claim',
      blocks: [
        'If you’ve suffered through an on-the-job accident in Virginia, you may need Workers’ Comp benefits to recover from your losses. Unfortunately, it’s not always easy to get compensated for those losses.',
        'That’s where [Pathfinder Injury Law](/) can help. If you’re struggling to get Virginia Workers’ Compensation, you can reach out to us for a free consultation. When you’re ready to get help with your claim, call {phone} or complete the {contact} below.',
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
      'If you were denied a claim, your [Virginia Workers’ Comp lawyer](/virginia-workers-comp-lawyer/) at Pathfinder Injury Law can help. We understand that getting your benefits can be tough, so seek out help when you’re struggling to recover.',
    ],
    sections: [
      {
        h2: 'Why Was My Claim Denied?',
        blocks: [
          'Before you take your claim to a hearing, your first step is determining why your [claim was denied](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-601.2/). Your denial letter should include a reason for the denial, but you may need to turn to a lawyer to get answers about what it means or what your next steps should be.',
          'Typically, a denial depends on the details of your accident. For example, you may not have had many witnesses who saw the accident. The insurance company may use this lack of evidence against you. Even if others did see your accident, you may be denied in other cases if you didn’t give notice on time. ' +
            NOTICE.replace('within thirty days of the injury', '[within thirty days of the injury](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-600/)'),
          'While individual Workers’ Comp cases vary, your lawyer can be a constant source of aid and guidance. Your lawyer can gather evidence supporting your claim and seek compensation on your behalf.',
        ],
      },
      {
        h2: 'Steps to Getting Your Workers’ Comp Benefits',
        blocks: [
          'Once you know why you were denied, your Workers’ Compensation lawyer can help you take the next steps toward your Workers’ Comp benefits.',
          'First, your lawyer can help you gather evidence that you’re due Workers’ Comp benefits. This evidence can show you were injured, you were actually injured on the job, and you’re unable to work until you’ve healed. Your benefits should cover [wage replacement](https://workcomp.virginia.gov/documents/injured-workers-benefits-guide), medical bill costs, and death benefits (if a loved one was [killed in a work accident](https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-512/)).',
          'But the insurance company may continue denying you the benefits you’re due for the severe injuries you suffered. ' +
            DISPUTE +
            ' Your lawyer will help you [prepare for your work comp hearing](/steps-to-take-before-a-workers-comp-hearing/).',
        ],
      },
    ],
    closing: {
      h2: 'Speak with a Lawyer About Your Workers’ Comp Denial',
      blocks: [
        'A work injury can make it difficult or even impossible to work, but your employer may not take the right steps to support you during this difficult time. That can leave you paying out of pocket for expenses you shouldn’t have to worry about.',
        'That’s where a Workers’ Comp lawyer at Pathfinder Injury Law can help. If you’ve been injured in a work-related accident and you’ve been denied compensation, we’re here to help. We can talk through the benefits you may be due when you seek out a free consultation. Call {phone} or fill out the {contact} below to learn more.',
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
          'The good news is, you may be eligible for both types of benefits. These benefits are offered through different systems. While these benefits may impact one another, together they can help with the financial strain of an injury. But receiving both can cause problems, so talk to a lawyer first.',
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
      h2: 'Seek Help from a Workers’ Comp Lawyer',
      blocks: [
        'Hurt in a work accident and unsure what benefits you qualify for? Your lawyer at Pathfinder Injury Law can talk with you about your options when you’re hurt in a work accident. We even offer free consultations, so reach out for the guidance you need. Call {phone}, or complete the online contact form below.',
      ],
    },
  },

  {
    slug: 'can-an-employer-deny-a-workers-comp-claim',
    title: "Can an Employer Deny a Work Comp Claim?",
    description:
      "Did your employer deny your VA workers' compensation claim? Call Pathfinder Injury Law for a 100% free consultation to discuss your options.",
    h1: 'Can an Employer Deny a Workers’ Comp Claim?',
    crumb: 'Can an Employer Deny a Claim?',
    intro: [
      'When you’re hurt in a serious work accident, [your Workers’ Compensation](/virginia-workers-comp-lawyer/) may be key to your recovery. Your injuries can be difficult to recover from without financial support.',
      'But you may have received a denial, rather than the Workers’ Comp benefits you need for your recovery. At Pathfinder Injury Law, we know a denial can be confusing, and we’re here to help. Here are some common reasons an employer may deny a Workers’ Comp claim and how we can help.',
    ],
    sections: [
      {
        h2: 'Reasons Employers Deny Workers’ Comp Claims',
        blocks: [
          'When an employer denies your Workers’ Comp claim, you need to know why you were denied before you get started. Knowing why you were denied can help your lawyer find the right approach to your claim.',
          'For example, your employer may claim you didn’t give notice on time. ' +
            NOTICE.replace('within thirty days of the injury', '[within thirty days of the injury](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-600/)') +
            ' If you don’t act on time, you may be denied your Workers’ Comp benefits. In these cases, your lawyer may focus on showing you reported the accident to your employer on time. Your lawyer can review the specific details of your claim with you.',
        ],
      },
      {
        h2: 'What Your Workers’ Comp Lawyer Can Do After a Denial',
        blocks: [
          'After suffering a work injury, you need work comp benefits as soon as possible, so your [denial](/virginia-workers-comp-lawyer/what-happens-if-your-workers-comp-claim-is-denied/) may be impacting your health and well-being. Because of this, you may need a lawyer who can act right away to seek a change for your claim.',
          'Your lawyer can seek out answers for why you were denied. If they’re unable to resolve the conflict with the employer, your lawyer can help you [file a claim](https://workcomp.virginia.gov/sites/default/files/documents/Injured-Worker-FAQs_0.pdf) for your benefits. ' +
            FILING,
          'Once you’ve filed your claim, you and your lawyer can prepare evidence that shows you were hurt and need Workers’ Comp benefits. You’ll then attend a hearing before the [Virginia Workers’ Compensation Commission](https://workcomp.virginia.gov/). There, your lawyer can advocate for the benefits you’re due and seek to reverse the denial you received.',
        ],
      },
    ],
    closing: {
      h2: 'Talk to a Lawyer Before Your Hearing',
      blocks: [
        'A Workers’ Comp claim denial can make it tough to focus on your recovery. It leaves you without the funds you need when you’re unable to work.',
        'But a denial isn’t always the end of your path to recovery. You may have grounds for Workers’ Comp benefits when you work with a lawyer from Pathfinder Injury Law. Your lawyer can look into the reason for your denial and pursue the compensation you need, starting with a free consultation. To get started, reach out by calling {phone} or by completing the online contact form below.',
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
      'But what if you’re able to work, just not in your former position? In these situations, you may be eligible for vocational rehabilitation that can help you get back to work. Vocational rehabilitation can be a benefit, but an employer can also use it against you, so talk to a lawyer first. Work with your [lawyer at Pathfinder Injury Law](/virginia-workers-comp-lawyer/) for guidance on getting back to building a career.',
    ],
    sections: [
      {
        h2: 'What Is Vocational Rehabilitation?',
        blocks: [
          'When you’re hurt at work, you may be unable to return to your job. For example, you may have suffered a brain injury that makes it difficult to focus, which may be a serious problem for your ability to complete your daily tasks.',
          'Vocational rehabilitation helps you find, train for, and get a job that you can complete despite your injuries. Vocational rehabilitation services [offer training services](https://www.workcomp.virginia.gov/sites/default/files/documents/Vocational-Rehabilitation-Guidelines.pdf) for those who may be able to work but are unable to return to their former positions.',
        ],
      },
      {
        h2: 'Taking Advantage of Your Workers’ Comp Benefits',
        blocks: [
          'Fortunately, you may be [eligible for these benefits](https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/) as part of your Workers’ Comp benefits. Vocational rehabilitation is available to many Virginia workers, who can take advantage of these benefits to build new job skills after a devastating injury.',
          'But your employer may try to avoid covering these services when you’re injured. If you’ve been refused the services you need to recover from your injuries and get back to work, talk to your Workers’ Comp lawyer about the benefits you may be entitled to.',
        ],
      },
    ],
    closing: {
      h2: 'Get Vocational Rehabilitation with a Lawyer’s Help',
      blocks: [
        'A serious work injury doesn’t have to end your career. Instead, you may have access to resources that help you get employment in a new position or field.',
        'Of course, that doesn’t mean it’s always easy to get that help. If you’re worried about your eligibility for vocational rehabilitation, reach out for guidance from a lawyer at Pathfinder Injury Law. Begin during a free consultation, where we can discuss your options for benefits. Reach out by calling {phone} or filling out the online contact form below.',
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
      'At Pathfinder Injury Law, we know these terms can be confusing, when all you need to know is how to get covered while you can’t work. Luckily, your [workers comp lawyer](/virginia-workers-comp-lawyer/) can help you deal with your doctors and your claim in order to protect your Workers’ Comp benefits.',
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
          'That means you may see some changes to your benefits, and you may feel that you’ve not yet reached maximum medical improvement. In a situation like this, you may need to speak with your Workers’ Comp lawyer in Virginia about your benefits and whether they cover all of your needs.',
        ],
      },
    ],
    closing: {
      h2: 'Talk to a Lawyer About Maximum Medical Improvement',
      blocks: [
        'If you’re concerned about your Workers’ Comp benefits, you need to understand all the factors that can impact your claim. For example, what is maximum medical improvement in Virginia Workers’ Comp claims, and how can it impact the funds you receive?',
        'You don’t have to have all the answers—that’s where Pathfinder Injury Law can help. We can pursue Workers’ Comp benefits that cover the losses you’ve suffered from your work accident. When you’re ready to seek compensation for your injuries, reach out for a free consultation by calling {phone} or completing the online contact form below.',
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
      'Because of this, you need to know how to prepare for an IME in Virginia. Luckily, our dedicated team at Pathfinder Injury Law has some tips to help you get ready and can represent you at every step of the Workers’ Comp process.',
    ],
    sections: [
      {
        h2: 'Bring Someone with You',
        blocks: [
          'When you schedule an appointment for your IME, you may want to bring someone with you. These exams are supposed to give insurers a clear medical opinion about your health, and it can impact your insurance. It’s easy to get frustrated or confused without a little help.',
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
          'Your work injury may not be the only thing affecting your overall health. Other health concerns may also be important to [your medical exam](https://www.vwcconference.workcomp.virginia.gov/materials/ABCs-of-FCEs-and-IMEs.pdf). For example, if you have a previous concussion, your injuries may have been worse than they would have been without that preexisting condition.',
          'But it can be tough to remember every surgery, diagnosis, and health condition on the spot. Because of this, you and your [Workers’ Comp lawyer](/virginia-workers-comp-lawyer/) in Virginia can review your medical history before your IME to ensure you have all the information you need.',
        ],
      },
    ],
    closing: {
      h2: 'Talk to Your Virginia Work Comp Lawyer Before Your IME',
      blocks: [
        'When you’re hurt in a serious Virginia work accident, attending an IME may be part of your Workers’ Comp process. But you may be worried and unsure how to prepare for an IME in Virginia. A mistake could leave you with a denial.',
        'A lawyer at [Pathfinder Injury Law](/) can help you deal with your IME appointment, starting with a free consultation about it. To work with our team, call {phone} or complete the online contact form below.',
      ],
    },
  },

  {
    slug: 'what-happens-after-a-workers-comp-ime-in-virginia',
    title: "What Comes After a Workers' Comp IME in Virginia?",
    description:
      "What happens after a workers' comp independent medical exam? Here's everything you need to know from Pathfinder Injury Law in Virginia.",
    h1: 'What Happens After a Workers’ Comp IME in Virginia?',
    crumb: 'What Happens After an IME',
    intro: [
      'An independent medical exam, or IME, may be part of getting your Workers’ Comp benefits. You may have already scheduled your IME and you’re getting ready to attend. But then what? What happens after a Workers’ Comp IME in Virginia?',
      'The results of your IME can impact your Workers’ Comp benefits. Because of this, you may need to speak to a dedicated lawyer from Pathfinder Injury Law. We can talk through the aftermath of your exam and what you can do to protect your Workers’ Comp benefits.',
    ],
    sections: [
      {
        h2: 'What’s an IME For?',
        blocks: [
          'An IME is a chance for the defense to [review your medical condition](https://www.vwcconference.workcomp.virginia.gov/materials/ABCs-of-FCEs-and-IMEs.pdf) with a doctor of their choosing. During the exam, the doctor will ask you questions about your health, your medical history, and how the injury happened. Unfortunately, these questions are more than a health test—they want to show you don’t need Workers’ Comp benefits.',
          'Because of this, you need to come prepared. Your [Workers’ Comp lawyer](/virginia-workers-comp-lawyer/) in Virginia can discuss the questions you’ll be asked and how you can prepare for a Workers’ Comp IME.',
        ],
      },
      {
        h2: 'Decisions After a Workers’ Comp IME in Virginia',
        blocks: [
          'After your Workers’ Comp IME, the doctor’s report will be reviewed, and you can receive either a positive or negative report. In some cases, the doctor may be on your side and say your injuries warrant Workers’ Comp benefits.',
          'But that’s not always the case. The IME doctor may have claimed you weren’t that seriously injured, and that can impact your [Virginia Workers’ Comp benefits](https://workcomp.virginia.gov/sites/default/files/documents/Injured-Worker-Benefits-Guide_0.pdf). Because of this, you may need to dispute their findings at a hearing before the Virginia Workers’ Compensation Commission.',
          'Luckily, you don’t have to do this alone. Your Workers’ Comp lawyer can help you prepare, gather evidence, and talk to witnesses before you attend a hearing.',
        ],
      },
    ],
    closing: {
      h2: 'Get Help with Your Workers’ Comp IME in Virginia',
      blocks: [
        'After a work injury, it can be tough to show you were actually hurt and need Workers’ Comp benefits. Even the doctors may be focused on showing you don’t need Virginia Workers’ Comp benefits.',
        '[Pathfinder Injury Law](/) is focused on your recovery and on helping you seek the Virginia Workers’ Comp coverage you need. If you’re ready to learn more about what happens after a Workers’ Comp IME in Virginia, reach out for a free consultation. Call {phone} or fill out the {contact} below.',
      ],
    },
  },

  {
    slug: 'how-to-calculate-a-virginia-workers-comp-settlement',
    title: "How is a Virginia Workers' Comp Settlement Determined?",
    description:
      "Pathfinder Injury Law will fight for your rights if you're hurt at work. Here's our guide to calculating Virginia workers’ comp settlements.",
    h1: 'How to Calculate a Virginia Workers’ Comp Settlement',
    crumb: 'How to Calculate a Settlement',
    intro: [
      'When you’ve suffered a work injury, you may need financial aid that covers your losses. The problem is, you don’t know how to calculate a Virginia Workers’ Comp settlement. You may have no experience, and your injuries may be sapping any time and energy you had for learning about Workers’ Comp law.',
      'That’s where Pathfinder Injury Law can help. If you’re hurt because of a work accident, reach out to a [dedicated lawyer](/virginia-work-injury-lawyer/) from our firm for help when calculating your Virginia Workers’ Comp settlement.',
    ],
    sections: [
      {
        h2: 'Adding Up Your Medical Costs',
        blocks: [
          'First, you need those medical bills covered, fast. They add up when you’re hurt, and you may need treatment for months or even years after your work accident. For injuries like spinal cord damage, you may face lifelong consequences for the work accident.',
          'Virginia workers can get their medical bills covered by Workers’ Comp. ' +
            MEDICAL +
            ' If you’re worried about paying out of pocket for your treatment, talk to your Workers’ Comp lawyer about your settlement.',
        ],
      },
      {
        h2: 'Your Virginia Disability Benefits',
        blocks: [
          'Your Virginia Workers’ Comp covers more than your hospital bills. Your Workers’ Comp settlement should also cover part of your wages when you’re unable to work.',
          'These benefits cover a [portion of your weekly income](https://workcomp.virginia.gov/documents/injured-workers-benefits-guide). The amount and duration of the benefits you receive will depend on the type of injury you suffered and whether you’re able to return to work in any capacity. If you’re not sure what disability benefits you’re due, talk to your Workers’ Comp lawyer in Virginia about what your settlement may be worth.',
        ],
      },
    ],
    closing: {
      h2: 'Talk to a Workers’ Comp Lawyer About Your Virginia Settlement',
      blocks: [
        'When you’re hurt in a Virginia work accident, recovery can be a drawn-out process. You need funds for your losses, but you may not know how to calculate a Virginia Workers’ Comp settlement. At [Pathfinder Injury Law](/), we’re prepared to help you understand what a settlement may need to cover. For a free consultation about your claim, call {phone} or fill out the following {contact}.',
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
      'At Pathfinder Injury Law, we’re here to help you understand the benefits you may be due. If you’re not sure what you’re eligible for after a work accident, reach out for help from our team. Continue reading to learn more.',
    ],
    sections: [
      {
        h2: 'Medical Bills',
        blocks: [
          'After a serious work injury, you shouldn’t have to pay for your medical care yourself. You may need to visit a doctor your employer chooses. If the employer denies your claim, you get to choose your own doctors. ' + MEDICAL,
          'These benefits should cover your travel to medical appointments, too. For example, you may have to travel out of your town to see a specialist about your injury, and workers’ comp can reimburse mileage for travel to and from medical appointments.',
        ],
      },
      {
        h2: 'Disability Benefits',
        blocks: [
          'You may be unable to work, but that doesn’t mean you can get by without an income. You still need some wage replacement benefits to cover your daily expenses and needs.',
          'Your disability benefits should cover at least part of your original wages. ' + TTD,
          TPD,
        ],
      },
      {
        h2: 'Death Benefits',
        blocks: [DEATH],
      },
    ],
    closing: {
      h2: 'Talk to a Workers’ Comp Lawyer in Virginia',
      blocks: [
        'After a work accident, you need Workers’ Comp benefits that cover your losses. But what does Workers’ Comp cover in Virginia? If you have questions about your benefits and what you’ll receive if you’re hurt, you may need a lawyer at [Pathfinder Injury Law](/) to guide you. For a free consultation, call us at {phone} or complete the online contact form below.',
      ],
    },
  },

  {
    slug: 'how-to-prepare-for-a-virginia-workers-comp-hearing',
    title: "Virginia Workers' Comp Hearing Guide | Pathfinder Injury Law",
    description:
      "Get ready for a Virginia workers' comp hearing with the help of Pathfinder Injury Law. Call us today at 804-505-0633.",
    h1: 'Virginia Workers’ Comp Hearing Preparation',
    crumb: 'Hearing Preparation',
    intro: [
      'After a serious work injury, you may have been denied Workers’ Compensation after reporting your injury. Now, you’ll need to dispute your employer and their Workers’ Comp insurer.',
      'If you’re unsure how to prepare for a Virginia Workers’ Comp hearing, reach out to a dedicated lawyer at Pathfinder Injury Law. We can help you prepare for your Virginia Workers’ Comp hearing and represent you throughout the process.',
    ],
    sections: [
      {
        h2: 'Gather Evidence',
        blocks: [
          'Before your hearing, you need to look at the reason for your denial. Your denial letter can show you why your claim was denied, as well as what you’ll need to prepare for your hearing.',
          'For example, let’s say you’re unable to perform at your job because of a work injury. The insurance company may deny you on the grounds that you don’t have enough medical evidence of your injury. In this case, you and your Workers’ Comp lawyer in Virginia may turn to your doctor for further exams and expert testimony.',
        ],
      },
      {
        h2: 'Calculate Your Workers’ Comp Benefits',
        blocks: [
          'During your Virginia Workers’ Comp hearing, you have a chance to ask for the benefits you need for your injuries. These benefits may include wage replacement, coverage for medical expenses, and more.',
          'If you don’t have the right tools, that is easier said than done. Luckily, your Workers’ Comp lawyer in Virginia can help.',
        ],
      },
    ],
    closing: {
      h2: 'Get a Workers’ Comp Lawyer’s Help Before Your Hearing',
      blocks: [
        'When you’re hurt in a work accident and your employer won’t pay, you may need to prepare for a Virginia Workers’ Comp hearing. The problem is, you may not have the tools you need to prepare for your Workers’ Comp hearing. At [Pathfinder Injury Law](/), we’re ready to guide you through your hearing, starting with a free consultation. Call {phone} or complete the online contact form below to learn more.',
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
      'But does Virginia Workers’ Comp pay for lost wages? If you’re worried about losing your wages, reach out to Pathfinder Injury Law. We can help you seek out the coverage you need from your Workers’ Comp provider.',
    ],
    sections: [
      {
        h2: 'Your Virginia Wage Replacement Benefits',
        blocks: [
          'When you’re hurt on the job in Virginia, you may be due benefits that cover your losses for a work accident. You may expect coverage for your medical bills, from specialist care to travel costs. But what about your wages?',
          'Your disability benefits should cover a portion of the wages you would have originally received. Although you won’t receive your full paycheck, these funds can help keep you and your family supported and fed while you heal from your injuries.',
        ],
      },
      {
        h2: 'How Much Will My Virginia Workers’ Comp Settlement Pay?',
        blocks: [
          'The funds you receive depend on your original wages and the severity of your injuries. For example, if you’re unable to work in any capacity, you may be eligible for total disability benefits. ' + TTD,
          'But let’s say you injured your back at work. You may be unable to perform all your usual tasks at work, but you’re able to work to some degree. In these cases, you may receive wages for the work you’re able to do, as well as partial disability benefits. ' +
            TPD +
            ' Your Workers’ Comp lawyer can go through the details of your Workers’ Comp payments with you.',
        ],
      },
    ],
    closing: {
      h2: 'Learn About Your Virginia Workers’ Comp Benefits for Lost Wages',
      blocks: [
        'When you’re hurt in a serious Virginia work accident, you may worry about your Workers’ Comp paying for lost wages. You need funds for more than your injuries, after all.',
        'Luckily, [Pathfinder Injury Law](/) is here to help. We can help you seek the Workers’ Comp you may be due for your lost wages. If you’re having trouble getting your Workers’ Comp benefits, reach out for a free consultation by calling {phone} or by completing the following online contact form.',
      ],
    },
  },

  {
    slug: 'average-workers-comp-settlement-in-virginia',
    title: "Average Virginia Workers' Compensation Settlement Amount",
    description:
      "Your Virginia workers’ comp settlement depends on your injuries. Visit the Pathfinder Injury Law website or call us at 804-505-0633 today.",
    h1: 'Average Workers’ Comp Settlement in Virginia',
    crumb: 'Average Settlement',
    intro: [
      'When you’re hurt in a work accident, you need funds that meet your needs for your recovery. Those funds should come from your Workers’ Comp settlement, but what should you realistically expect?',
      'At Pathfinder Injury Law, we can help you understand what you may be due after a work accident. If the average Workers’ Comp settlement in Virginia isn’t enough for you to recover, we can talk through what your situation may need.',
    ],
    sections: [
      {
        h2: 'Your Workers’ Comp Settlement Depends on Your Injuries',
        blocks: [
          'Every work accident is different, and so every Virginia work compensation settlement is different. Because of this, you may have a little trouble settling your claim.',
          'Luckily, your [Workers’ Comp lawyer in Virginia](/virginia-workers-comp-lawyer/) can step in and help you work through your losses and needs. For example, how do you calculate the value of your [vision loss](https://workcomp.virginia.gov/sites/default/files/documents/Claims-Services-Quick-Reference-Guide_0.pdf) after a work injury damages your eyes? Your lawyer has the tools to calculate the percentage of loss you’ve suffered and the benefits you may receive for it.',
        ],
      },
      {
        h2: 'Understanding Your Virginia Workers’ Comp',
        blocks: [
          'Because your Workers’ Comp settlement can be so complex, you may need a work compensation lawyer to help determine what benefits you may be due. In Virginia, you can receive partial or total disability benefits, for example, which impact the funds you’ll receive.',
          'These disability benefits depend on the severity of your injury and whether you’re able to work in any capacity. If you’re able to work, but you can’t do your old job, you may be put in a less-strenuous position. In these cases, you may be eligible for partial disability benefits, which cover some of the difference between your current and former wages. Talk to your lawyer about what benefits you’re due.',
        ],
      },
    ],
    closing: {
      h2: 'Talk to a Lawyer About Your Workers’ Comp Settlement in Virginia',
      blocks: [
        'A serious work accident can leave you unable to work as you once did and in need of funds for yourself and your family. Unfortunately, you may be worried that you won’t even receive the average Workers’ Comp settlement in Virginia, let alone the full amount you need.',
        '[Pathfinder Injury Law](/) can help. If you’re struggling with a Workers’ Comp claim, your lawyer can talk with you about the compensation you may be due for your losses. Take advantage of our free consultations by calling {phone} or by completing the online contact form below.',
      ],
    },
  },

  {
    slug: 'how-is-workers-comp-calculated-in-virginia',
    title: "How Is Workers’ Comp Benefits Calculated in Virginia?",
    description:
      "How is workers’ comp calculated in Virginia? Pathfinder Injury Law has what you need to know for your work injury case.",
    h1: 'How Is Workers’ Comp Benefits Calculated in Virginia?',
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
      h2: 'Know Your Claim’s Value with Help from a Virginia Workers’ Comp Lawyer',
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
      'Here’s the good news—a lawyer from Pathfinder Injury Law could help you speed up the process. If you’re struggling to overcome your injuries following a work accident, take a look at how you can get your benefits as soon as possible and how a [Workers’ Comp lawyer in Virginia](/virginia-workers-comp-lawyer/) can help.',
    ],
    sections: [
      {
        h2: 'Filing Your Claim Quickly',
        blocks: [
          'After a work accident, you need to report your injuries to your employer and request your Workers’ Comp benefits as soon as possible. ' + NOTICE + ' ' + FILING,
          'Even if you feel fine, you may also need to head to the hospital as soon as possible. Delayed injuries may not be obvious right away, and it can hurt your claim if the insurance company thinks you weren’t injured in the accident. Getting looked at as soon as possible helps erase those doubts.',
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
    title: "Virginia Workers Compensation Pay Waiting Period",
    description:
      "When does Virginia workers’ comp start paying? Find out with the help of an experienced work compensation lawyer at Pathfinder Injury Law.",
    h1: 'When Does Virginia Workers’ Comp Start Paying?',
    crumb: 'When Benefits Start',
    intro: [
      'After a serious Virginia work accident, you may need Workers’ Comp benefits to cover the expenses you’re not currently able to pay. But when does Virginia Workers’ Comp start paying? You may be worried that your expenses can’t wait.',
      'Pathfinder Injury Law can help you understand when payments may begin so you can plan for your costs. Your [work compensation lawyer](/virginia-workers-comp-lawyer/) can help you find the quickest path to recovery.',
    ],
    sections: [
      {
        h2: 'As Soon as You’re Approved',
        blocks: [
          'If you’ve filed for Workers’ Comp, you may already be on your way to the [benefits you’re due](https://workcomp.virginia.gov/documents/injured-workers-benefits-guide). Once you’ve reported your accident to your employer, they should notify the insurance company. The adjuster should then review your accident and determine whether you’re eligible for compensation. Be careful what you say to the adjuster, and do not assume they are looking out for you.',
          'If you’re approved, your Workers’ Comp benefits should start coming soon. Your Workers’ Comp should cover your losses as soon as possible so you don’t have to worry about missing bill payments or not being able to cover your necessities. However, there is a seven-day waiting period in Virginia before wage loss benefits begin. Then, if you’re out of work for more than 21 days, the insurance company should go back and pay those first seven days.',
        ],
      },
      {
        h2: 'What if I’m Denied Virginia Workers’ Comp?',
        blocks: [
          'Not everyone receives an approval for their Virginia Workers’ Comp right away. You may have first received a denial letter, for example, which means you’ll be waiting longer for your Workers’ Comp payments.',
          'Luckily, your Workers’ Comp lawyer in Virginia can help you seek Workers’ Comp even if you’ve been denied. They can help you determine why your claim was denied. Then, they can guide you through [disputing the denial](https://www.workcomp.virginia.gov/sites/default/files/documents/Claims-and-Hearings-Flow-Chart.pdf) at a hearing so you can still go after the Workers’ Comp you’re due.',
        ],
      },
    ],
    closing: {
      h2: 'Talk to a Workers’ Comp Lawyer in Virginia About Your Payments',
      blocks: [
        'Your Virginia Workers’ Comp benefits should cover the losses you’ve suffered because of your injuries. But when does Virginia Workers’ Comp start paying? It can take time before you see results. But you don’t have to wait around. Take the first step by contacting [Pathfinder Injury Law](/) for a free consultation. Call {phone} or fill out the online contact form on this page to get help seeking your payments.',
      ],
    },
  },

  {
    slug: 'if-i-get-injured-at-work-in-virginia-do-i-get-paid',
    title: "Are You Eligible For Compensation If Hurt At Work in VA?",
    description:
      "Can you get paid after a work accident? Here's what you should know about Virginia workers' comp cases, according to Pathfinder Injury Law.",
    h1: 'If I Get Injured at Work in Virginia, Do I Get Paid?',
    crumb: 'Do I Get Paid If Injured at Work?',
    intro: [
      'After a serious work injury, working may be out of the question. When you’re injured at work in Virginia, you need to get paid, but you can’t get your usual paycheck. So how do you pay for your needs after an accident?',
      'Your lawyer at Pathfinder Injury Law can talk with you about the benefits that may be available when you’re struggling to overcome your work injuries.',
    ],
    sections: [
      {
        h2: 'Your Workers’ Comp Benefits',
        blocks: [
          'If you’re injured at work in Virginia, you may be due benefits for your injury. ' + NO_FAULT + ' ' + FAULT,
          MEDICAL + ' Your benefits may also cover the wages you’ve lost because you’re unable to work. Your Workers’ Comp lawyer can review the details of your benefits and what funds you could receive because of your injury.',
        ],
      },
      {
        h2: 'Virginia’s Worker Comp Claim Process',
        blocks: [
          'Getting Workers’ Comp coverage isn’t always easy. You need to take the right steps to protect your claim and get the funds you’re due.',
          'For example, you’ll first need to act fast and [report your injury](https://www.workcomp.virginia.gov/sites/default/files/documents/Injured-Worker-FAQs_1.pdf) as soon as possible. ' + NOTICE + ' ' + FILING + ' Once you report your Virginia work accident, your employer must contact the insurance company about coverage and your benefits.',
          'The insurance adjuster will then review your accident and determine what benefits you’re due. Then, you’ll get a notification approving or denying those benefits. Be careful what you say to the adjuster, and do not assume they are looking out for you. If you’re denied, don’t panic. ' + DISPUTE + ' Your lawyer can help you [seek the Workers’ Comp benefits](/virginia-workers-comp-lawyer/) you’re due.',
        ],
      },
    ],
    closing: {
      h2: 'Speak with a Workers’ Comp Lawyer in Virginia',
      blocks: [
        'After a work-related accident, you need help recovering from your injuries. But if you get injured at work in Virginia, how do you get paid? You can learn more with help from [Pathfinder Injury Law](/). If you’re hurt and need Workers’ Comp benefits, reach out to a lawyer by calling {phone} or by completing the online contact form below.',
      ],
    },
  },
];
