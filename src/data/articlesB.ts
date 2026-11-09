// Wording for the "articles B" pages (work injury, claim process, settlement and similar).
// Carried over from the current live site, with these changes (Bryn's decisions, Oct 28):
//  - Work illness removed everywhere ("or illness", "disease", the link to the work-illness page).
//  - Structured settlements removed. Outside-source links removed (SSA, winchesterva.gov); only the
//    Commission, Virginia Code and court links remain.
//  - Legal statements that the Workers' Comp page already carries use that page's reviewed wording:
//    employer threshold ("three or more people, which usually means two or more employees plus the
//    owner"), notice within thirty days of the injury, claim filed within two years "although
//    exceptions apply", compensable-accident wording, TTD/TPD/PPD wording, the two settlement types,
//    death benefits, the denial-reasons list, "request a hearing before the Commission".
//  - "Appeal", "court" and "courtroom" for a Commission hearing became "hearing before the Commission".
//  - Outcome promises and comparisons softened ("know how to win", "maximum benefits", "guide you to
//    success", "you can be sure you will receive full benefits").
//  - Plural "lawyers" in descriptions changed to singular or "our team" (plan Section VIII, fix 6).
// Statements left as on the live site, with no reviewed equivalent, are marked "LIVE WORDING" so they
// are easy to find: they still need Bryn's review. See the hand-over note for the full list.

export interface ArticleB {
  path: string;
  title: string;
  description: string;
  h1: string;
  // Name shown in the last breadcrumb slot when it should differ from the h1.
  crumb?: string;
  // Breadcrumb parents between Home and this page.
  parents?: { name: string; path: string }[];
  lead: string;
  sections: { id: string; h2: string; html: string }[];
  closing: { h2: string; html: string };
}

const phone = '<a href="tel:+18045050633">804-505-0633</a>';
const WC = '/virginia-workers-comp-lawyer/';

export const articlesB = {
  // ---------------------------------------------------------------------------------------------
  workInjury: {
    path: '/virginia-work-injury-lawyer/',
    title: 'Virginia Work Injury Lawyer | Work Injury Claims',
    // Live: "led by experienced workers' compensation lawyers".
    description:
      "Pathfinder Injury Law is led by an experienced workers' compensation lawyer. Explore your eligibility for Virginia work injury comp today.",
    h1: 'Virginia Work Injury Lawyer',
    lead: `
      <p class="lead">Hurt in a Virginia work accident? Your injury lawyer can help you get compensated when you’re hurt on the job.</p>
      <p>No matter where you work, you can be injured at any time. When that happens, you may have trouble getting compensated for your injuries. You’re certain you have Workers’ Comp benefits, but you may be unsure how to take advantage of these benefits in Virginia.</p>
      <p>That’s where Pathfinder Injury Law can help. Talk to a Virginia work injury lawyer about your injuries and your potential benefits after your accident.</p>`,
    sections: [
      {
        id: 'eligibility',
        h2: 'Eligibility for Virginia Work Injury Compensation',
        // Live: "almost all workers... Any employer with three or more employees must provide...".
        html: `
          <p>One of your first concerns may be about whether you’re eligible for Workers’ Compensation benefits. The Virginia Workers’ Compensation Act requires virtually all Virginia employers with three or more employees regularly in service to have workers’ compensation insurance which provides workers’ compensation benefits in the event of an accident.</p>
          <p>But things are more complicated for those <a href="https://workcomp.virginia.gov/sites/default/files/documents/Employer-FAQs_1.pdf" rel="noopener">listed as independent contractors</a>. If you believe you should be counted as an employee, your work injury lawyer can help you build a case to prove you were acting as an employee in order to seek the coverage you need.</p>`,
      },
      {
        id: 'benefits',
        h2: 'Benefits for Injured Virginia Workers',
        // Benefit descriptions use the reviewed Workers' Comp page wording.
        html: `
          <p>Before you get your Workers’ Comp benefits, you need to know what benefits you’re eligible for. Below are some of the workers comp benefits you may receive after a work injury:</p>
          <ul>
            <li><strong>Medical Cost Coverage</strong>: The insurance company is required to pay for medical treatment that is reasonable, necessary, and causally related to your work accident, including travel and specialists. That doesn’t mean it will.</li>
            <li><strong>Temporary Partial Disability Benefits</strong>: You may receive benefits to help offset loss of income when your doctor only allows you to return to work with restrictions and you are earning less than you were before you got hurt. The amount paid is two-thirds of the difference between what you were earning before you got hurt, and what you are earning now.</li>
            <li><strong>Temporary Total Disability Benefits</strong>: If a doctor says you <a href="https://workcomp.virginia.gov/documents/injured-workers-benefits-guide" rel="noopener">cannot return to work at all</a> for a temporary period because of your injuries, you may receive two-thirds of the pre-injury average weekly wage you received during the year immediately prior to your accident, up to a maximum weekly compensation rate.</li>
            <li><strong>Permanent Partial Disability Benefits</strong>: When a doctor determines you have recovered from your injury as much as possible and assigns a permanent impairment rating greater than zero percent to a body part that is eligible for permanent partial disability benefits, you may be entitled to workers’ comp benefits for the permanent damage you have suffered in that body part.</li>
          </ul>`,
      },
      {
        id: 'denied',
        h2: 'What if My Virginia Work Injury Claim Is Denied?',
        // Live said "appeal that denial"; reviewed wording is a hearing before the Commission.
        html: `
          <p>If your Virginia worker injury claim is denied, don’t panic. You’re not out of options for your Workers’ Comp claim. You have the right to dispute that denial and take your claim to a hearing before the Virginia Workers’ Compensation Commission, and a work injury lawyer can help.</p>
          <p>Your lawyer can gather evidence that shows you’re due Workers’ Comp. For example, if the insurance company claims there’s not enough evidence of your injuries, your lawyer may speak with your doctor about your injuries.</p>
          <p>Once they have the needed evidence, your lawyer can represent you in a hearing with the Virginia Workers’ Compensation Commission. During your hearing, they’ll present your evidence, which can be key to getting your claim approved.</p>`,
      },
      {
        id: 'process',
        h2: 'Let a Virginia Work Injury Attorney Guide You Through the Process',
        // Live also said employers "will have to provide you with options for physicians" (no reviewed
        // equivalent), so that sentence is left out. Notice period uses the reviewed thirty days.
        html: `
          <p>So you’ve been <a href="${WC}">injured at work</a>. Now what? First, don’t panic. There are several steps you can take in order to make things a little easier:</p>
          <ul>
            <li><strong>Report Your Injury:</strong> As soon as you’re able, make sure you report your injury to your employer. The Virginia Workers’ Compensation Act requires you to give notice to your employer within thirty days of the accident, although exceptions exist, and prompt reporting is important to try and avoid having your claim denied.</li>
            <li><strong>Keep Track of Everything:</strong> When getting treatment, it’s important to keep track of everything. Missed days, lost wages, out of pocket expenses. It’s better to have too much information than too little.</li>
            <li><strong>Contact a Work Injury Lawyer:</strong> Facing a workers’ comp case can be frightening, so it can be helpful to find an attorney for assistance. Pathfinder Injury Law is here to help explain the specifics of Virginia work injury law and guide you through your case.</li>
          </ul>`,
      },
    ],
    closing: {
      h2: 'Contact a Work Injury Lawyer in Virginia',
      // Live: "putting in the hard work to help you achieve positive results. Our expertise—combined...".
      html: `
        <p>After a work injury, you need <a href="${WC}">Workers’ Comp benefits</a> that cover your needs. Those benefits can include your medical care and part of your lost wages. But what if you have some trouble getting your benefits in Virginia?</p>
        <p><a href="/">Pathfinder Injury Law</a> cares deeply about our clients and invests ourselves in your struggle, putting in the hard work for you. Our experience, combined with our care and our friendly approach, help not just to guide clients through their cases, but to put their minds at ease. Want to learn more? Give us a call at ${phone} today to get your free no-obligation consultation.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  delayedBenefits: {
    path: '/what-if-a-workers-comp-insurer-delays-my-benefits/',
    // Oct 31 SEO rewrite: answer-first, cited, checked by the authority check (SEO Audit file 15a).
    title: 'Workers’ Comp Insurer Delaying Benefits in Virginia?',
    description:
      'What to do when a Virginia workers’ comp insurer delays checks or treatment: the 20% late-payment penalty, a Commission hearing, and what to document.',
    h1: 'What Happens if a Workers’ Comp Insurer Delays Benefits?',
    lead: `
      <p class="lead">If a Virginia workers’ comp insurance company is late paying benefits it owes under an award, the law adds 20 percent to any payment more than two weeks late, unless the Commission finds the delay had good cause outside the employer’s control (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-524/" rel="noopener">Va. Code § 65.2-524</a>). If there is no award yet, or the insurance company is stalling on a claim or a treatment request, the answer is the Commission: you can ask for a hearing no matter what the insurance company decides.</p>
      <p>What you can do depends on why the money or treatment is late, and on whether you already have an award. Here is how to tell which situation you are in.</p>`,
    sections: [
      {
        id: 'why',
        h2: 'Why Workers’ Comp Benefits Get Delayed',
        html: `
          <p>The insurance company is required to pay a covered claim, but that doesn’t mean it will pay on time. Common reasons for a delay are a few of many:</p>
          <ul>
            <li>No claim has been filed with the Commission, so nothing forces a decision.</li>
            <li>The insurance company is “investigating,” waiting on medical records, or waiting for a <a href="/insurance-recorded-statement/">recorded statement</a>.</li>
            <li>There is a dispute over your average weekly wage, so nobody agrees on the amount.</li>
            <li>The Award Agreement hasn’t been sent, signed, or entered by the Commission.</li>
            <li>The insurance company sent you to an <a href="${WC}what-happens-after-a-workers-comp-ime-in-virginia/">IME</a> and is using the report to question your claim.</li>
            <li>It says you can do light duty, or that you turned down a job.</li>
          </ul>`,
      },
      {
        id: 'no-award',
        h2: 'If You Don’t Have an Award Yet',
        html: `
          <p>Until there is an award, the insurance company may pay voluntarily, but there is no Commission order requiring it to pay you. That is why the first step is a filed claim. Once you file, the Commission will order the insurance company to respond within 30 days. It may accept the claim or deny it. If it denies the claim or doesn’t answer, you can ask for a hearing before a deputy commissioner.</p>
          <p>File the claim even if the insurance company says it is accepting your injury. A claim must be on file with the Virginia Workers’ Compensation Commission within two years of your date of accident, although exceptions apply. Here’s <a href="/how-to-file-a-workers-comp-claim/">how to file a workers’ comp claim</a>.</p>`,
      },
      {
        id: 'award',
        h2: 'If You Have an Award and the Checks Are Late or Stopped',
        html: `
          <p>An award is an order of the Commission. Once you have one, the insurance company can’t just stop paying because it decides you are better. To stop or reduce your checks, it has to file an application with the Commission (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/" rel="noopener">Va. Code § 65.2-708</a>).</p>
          <ul>
            <li>A payment more than two weeks late gets the 20 percent addition, unless the Commission finds the delay had good cause outside the employer’s control (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-524/" rel="noopener">Va. Code § 65.2-524</a>).</li>
            <li>If the checks stop without an application, you can ask the Commission for a hearing to enforce the award.</li>
            <li>If the insurance company defends a case without reasonable grounds, the Commission can make it pay the costs of the proceeding, including a reasonable attorney’s fee (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-713/" rel="noopener">Va. Code § 65.2-713</a>).</li>
          </ul>`,
      },
      {
        id: 'medical',
        h2: 'If the Insurance Company Is Delaying Treatment',
        html: `
          <p>Medical delays work differently from late checks. The insurance company may sit on a request for surgery, an MRI, or a referral to a specialist, or deny it after a records review or an IME. The insurance company is required to provide medical treatment that is reasonable, necessary, and causally related to the accident (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/" rel="noopener">Va. Code § 65.2-603</a>). When it won’t authorize that care, you can ask the Commission to order it.</p>`,
      },
      {
        id: 'document',
        h2: 'What to Do While You Wait',
        html: `
          <ul>
            <li>Check whether a claim has been filed. If not, file one.</li>
            <li>Write down every call with the <a href="/how-to-avoid-work-comp-adjusters-tricks/">adjuster</a>: date, time, name, and what was said.</li>
            <li>Ask for anything important in writing, and send your own requests in writing.</li>
            <li>Keep your pay stubs and every out-of-work note from your doctor.</li>
            <li>Keep going to your doctor and following your restrictions. Gaps in treatment become the insurance company’s next argument.</li>
          </ul>
          <p>Here’s <a href="${WC}when-does-virginia-workers-comp-start-paying/">when Virginia workers’ comp starts paying</a> and <a href="${WC}what-happens-if-your-workers-comp-claim-is-denied/">what happens if your claim is denied</a>.</p>`,
      },
    ],
    closing: {
      h2: 'Is the Insurance Company Stalling?',
      html: `<p>Delays are rarely just paperwork. They usually mean the insurance company is building a reason to pay less: a wage dispute, an IME, a light-duty offer. Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call ${phone} or <a href="#contact">use the contact form</a> on this page.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  taxable: {
    path: '/are-workers-comp-benefits-taxable/',
    title: 'Are Workers’ Comp Benefits Taxable? - Pathfinder Injury Law',
    description:
      "Are workers' comp benefits taxable? Usually not. What the IRS says, and the Social Security Disability exception that catches people.",
    h1: 'Are Workers’ Comp Benefits Taxable?',
    lead: `
      <p class="lead">An on-the-job injury can be costly, taking time and money to overcome the injuries you suffered. Workers’ comp can help cover many of those expenses while you recover. You need as much of your benefits as possible, but what about your taxes?</p>
      <p>No one wants to be caught off-guard when tax season arrives after a serious <a href="/virginia-work-injury-lawyer/">work accident</a>. Here’s what the IRS says about <a href="${WC}">workers’ comp</a> benefits, and the one exception that catches people.</p>`,
    sections: [
      {
        id: 'taxed',
        h2: 'Are My Benefits Taxable?',
        // LIVE WORDING (tax statements, no reviewed equivalent). The live sentence that an employer "may
        // be able to get a tax break" (with a winchesterva.gov link) is left out: outside source.
        html: `
          <p>Workers’ comp benefits paid under a workers’ compensation act are fully exempt from federal income tax, according to the IRS (<a href="https://www.irs.gov/publications/p525" rel="noopener">IRS Publication 525</a>). These benefits aren’t a form of income like your wages before the accident were. These benefits are repayment for a single work accident paid through an insurance policy. Because of that, you shouldn’t have to worry about including your workers comp benefits in your taxes. Wages you earn on light duty are still taxed like any paycheck. Your own tax situation can have wrinkles, so check with a tax professional.</p>`,
      },
      {
        id: 'ssdi',
        h2: 'SSDI Benefits May Be Taxed',
        // Live: SSDI benefits "are taxable" with an SSA link; now "may be taxable", SSA links removed.
        html: `
          <p>But that doesn’t mean other benefits and payments can’t be taxed. For example, if you’ve suffered an injury that leads to a lifelong disability, you may be eligible for Social Security Disability Benefits (SSDI). Unlike your Workers’ Comp benefits, your <a href="${WC}can-i-receive-workers-comp-and-social-security-disability-at-the-same-time/">SSDI benefits may be taxable</a>.</p>
          <p>That’s because SSDI benefits offer constant coverage for people with disabilities, rather than payments for a single work accident. You don’t have to be injured on the job to receive SSDI benefits. You just need a disability that impacts your ability to work.</p>
          <p>If you get both, the part of your workers’ comp that reduces your SSDI is treated as a Social Security benefit, and it may be taxable (<a href="https://www.irs.gov/publications/p525" rel="noopener">IRS Publication 525</a>).</p>`,
      },
      {
        id: 'due',
        h2: 'Getting the Benefits You’re Due',
        // Live: "guide you through the appeals process to get the funds you're due". The live link on "cut off"
        // went to a page that is not in the plan's inventory, so it is dropped.
        html: `
          <p>Even without the threat of losing a large portion of your benefits to taxes, you may have some worries about getting the benefits you’re due. For example, your Workers’ Compensation may have been cut off before you were able to return completely to work.</p>
          <p>When this happens, you can request a hearing before the <a href="https://workcomp.virginia.gov/" rel="noopener">Virginia Workers’ Compensation Commission</a> to seek the benefits you’re due, just as you can <a href="${WC}what-happens-if-your-workers-comp-claim-is-denied/">when you’re denied</a>.</p>`,
      },
    ],
    closing: {
      h2: 'Questions About Your Workers’ Comp Checks?',
      html: `<p>Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call ${phone} or <a href="#contact">use the contact form</a> on this page.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  afterFiling: {
    path: '/what-happens-when-you-file-a-workers-comp-claim/',
    title: "What Happens After You've Filed a Work Comp Claim?",
    // Live: "from the trusted lawyers at Pathfinder Injury Law".
    description:
      "What happens when you file a Virginia workers' comp claim? Here's what you need to know from the trusted team at Pathfinder Injury Law.",
    h1: 'What Happens After You File a Workers’ Comp Claim?',
    lead: `
      <p class="lead">After a serious work accident, you may have immediately reported your accident to your employer. They need to know about injuries that happen at work, and they’re responsible for your Workers’ Comp benefits.</p>
      <p>But once you file a <a href="${WC}">Workers’ Comp</a> claim, what happens? Here’s what to expect, in order.</p>`,
    sections: [
      {
        id: 'review',
        h2: 'Your Insurer Will Review the Claim',
        // Live said "When you file ... within thirty days, your employer must then notify the insurance
        // company". That mixed up the thirty-day notice and the two-year filing deadline, and the
        // employer-notifies-insurer sentence has no reviewed equivalent, so it is rewritten.
        html: `
          <p>The Virginia Workers’ Compensation Act requires notice to your employer within <a href="https://workcomp.virginia.gov/content/injured-workers" rel="noopener">thirty days of the accident</a>, and your claim must be on file with the Virginia Workers’ Compensation Commission within two years of your date of accident, although exceptions apply. Once you’ve done this, the insurance company is responsible for assessing your claim.</p>
          <p>This review is meant to determine whether you were seriously injured, whether your injuries happened on the job, and what funds you’re due for the injuries you suffered.</p>
          <p>After you file, the Commission will order your employer’s insurance company to respond to your claim within 30 days. It may accept the claim or deny it.</p>`,
      },
      {
        id: 'approved-or-denied',
        h2: 'You May Be Approved or Denied',
        // Denial reasons use the reviewed Workers' Comp page list.
        html: `
          <p>If your claim is accepted, workers’ comp can pay for your medical treatment and part of your wages for the time you’re unable to work. If the insurance company accepts your claim for lost wages, it sends you an Award Agreement. Once that is signed and the Commission enters an award, you are paid for the time you are unable to work because of the injury, starting on day 8.</p>
          <p>But you’re not out of options just <a href="https://www.workcomp.virginia.gov/sites/default/files/documents/Injured-Worker-FAQs_1.pdf" rel="noopener">because you were denied</a>. Denials can happen for a number of reasons. Once you know why your claim was denied, you can begin to <a href="/how-to-appeal-a-workers-comp-denial-in-virginia/">dispute the denial</a>.</p>
          <p>Reasons for an initial denial often include:</p>
          <ul>
            <li>Lack of sufficient evidence regarding your injuries;</li>
            <li>No medical treatment after the injury; or</li>
            <li>Failing to provide notice to your employer within the appropriate amount of time</li>
            <li>An insurance adjuster just not paying attention to your claim</li>
            <li>Filing after the two-year deadline.</li>
          </ul>`,
      },
      {
        id: 'hearing',
        h2: 'You Have a Chance to Dispute the Denial',
        // Live: "seek out a hearing to appeal your claim ... Your appeal is a chance to present new evidence".
        html: `
          <p>Once you know why your Workers’ Comp claim was denied, you can request a hearing to dispute the denial. The hearing will be held before the <a href="https://workcomp.virginia.gov/" rel="noopener">Virginia Workers’ Compensation Commission</a>. You can ask for a hearing no matter what the insurance company decides, including when it accepts the claim but refuses to pay for certain treatment or benefits.</p>
          <p>At the hearing, a deputy commissioner hears the evidence and decides whether benefits are due. The hearing is a chance to present new evidence and details for your claim. Because of this, it’s important to <a href="${WC}how-to-prepare-for-a-virginia-workers-comp-hearing/">be prepared for your hearing</a> with the medical records and other evidence you need.</p>`,
      },
    ],
    closing: {
      h2: 'Filed Your Claim and Waiting to Hear Back?',
      html: `<p>The insurance company writes the 30-day answer and the Award Agreement. You decide whether to sign that agreement and whether to ask for a hearing. Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call ${phone} or <a href="#contact">use the contact form</a> on this page.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  claimOpen: {
    path: '/how-long-can-a-workers-comp-claim-stay-open/',
    title: 'How Long Can a Workers’ Comp Claim Stay Open in Virginia?',
    // Rewritten Nov 9, 2026 (schedule #6): Search Console showed "how long can a workers' comp claim
    // stay open" at position 20 on 851 impressions, and reopening searches at 11 to 35. Law check:
    // audit file 54b.
    description:
      'A Virginia workers’ comp claim with an award can stay open for life for medical care. Wage checks have a 24-month reopening deadline. Here’s how each clock works.',
    h1: 'How Long Can a Workers’ Comp Claim Stay Open in Virginia?',
    crumb: 'How Long a Claim Stays Open',
    lead: `
      <p><em>Nothing on this page should be taken as legal advice. Every case is different.</em></p>
      <p class="lead">In Virginia, a workers’ comp claim with an award stays open for medical care for as long as the care is necessary, which can be for life, unless you settle it with a full and final settlement (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/">Va. Code § 65.2-603</a>). Wage checks are different. Once they stop, you generally have 24 months from the last day you were paid compensation under an award to ask the Commission to start them again because your condition changed (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/">Va. Code § 65.2-708</a>).</p>
      <p>Before any of that, the claim has to be opened in time. A claim must be on file with the Virginia Workers’ Compensation Commission within two years of your date of accident, although exceptions apply (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-601/">Va. Code § 65.2-601</a>). Each of these clocks runs on its own, and missing one can close part of a claim for good even while the rest stays open.</p>`,
    sections: [
      {
        id: 'clocks',
        h2: 'The Clocks That Decide How Long a Claim Stays Open',
        html: `
          <p>A Virginia comp claim is not one thing that is either open or closed. Each benefit has its own deadline.</p>
          <table>
            <thead><tr><th>Clock</th><th>How long</th><th>Runs from</th><th>Law</th></tr></thead>
            <tbody>
              <tr><td>Notice to your employer</td><td>30 days, although exceptions exist</td><td>The accident</td><td><a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-600/">§ 65.2-600</a></td></tr>
              <tr><td>Filing a claim with the Commission</td><td>2 years, although exceptions apply</td><td>The accident</td><td><a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-601/">§ 65.2-601</a></td></tr>
              <tr><td>Medical care under an award</td><td>As long as necessary, which can be for life</td><td>The award</td><td><a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/">§ 65.2-603</a></td></tr>
              <tr><td>Reopening wage checks for a change in condition</td><td>24 months</td><td>The last day compensation was paid under an award</td><td><a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/">§ 65.2-708</a></td></tr>
              <tr><td>Reopening for permanent partial disability</td><td>36 months</td><td>The last day compensation was paid under an award</td><td><a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/">§ 65.2-708</a></td></tr>
              <tr><td>Total wage benefits</td><td>500 weeks, with exceptions such as permanent and total incapacity</td><td>Counts weeks of wage benefits paid, not calendar time</td><td><a href="https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-518/">§ 65.2-518</a></td></tr>
            </tbody>
          </table>
          <p>A full and final settlement, once the Commission approves it, closes everything it covers, including future medical care (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-701/">Va. Code § 65.2-701</a>). Here’s <a href="/how-long-does-workers-comp-last-in-virginia/">how long each workers’ comp benefit lasts</a> while the claim is open.</p>`,
      },
      {
        id: 'file',
        h2: 'Why the Claim Has to Be Filed, Even if the Insurer Is Paying',
        html: `
          <p><strong>The insurance company paying your bills or your checks does not open a claim with the Commission.</strong> A claim filed with the Commission, or an award, is what protects your rights. If two years pass without a claim on file, the right to benefits for that accident can be lost unless an exception applies. The insurer’s payments can pause the deadline in some cases, but not in every case.</p>
          <p>The law pauses the two-year deadline in some cases. If your employer knew about the accident and paid you compensation or wages while you were out of work, or provided medical care through its workers’ comp insurance, the deadline can be paused until the last of those payments or treatments, as long as it came more than six months after the accident. Payments made after the two years already ran out don’t count. The deadline is also paused for as long as the employer fails to file the accident report the law requires (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-602/">Va. Code § 65.2-602</a>). Whether a pause applies, and for how long, is often a fight. Filing the claim avoids it.</p>
          <p>If your employer said or did something that led you to miss the deadline, like telling you your claim was already filed, the Commission may still hear a late claim. Paying benefits and medical bills, by itself, is not enough (a Court of Appeals decision involving Old Dominion Power Co., Record No. 1866-00-3 (2001)).</p>
          <blockquote><p>“Even when the insurance company is paying, I tell people to file a claim with the Commission. The insurer accepting your claim today doesn’t protect your deadline.” (Bryn Swartz)</p></blockquote>
          <p>The claim should also list every body part that was hurt. If a body part is left off and no claim for it is filed within the two years, the Commission can find the claim for that body part too late, even though the rest of the claim was on time (a Supreme Court of Virginia decision involving Shea-Ball Construction Co., 216 Va. 442 (1975)). Here’s <a href="/how-to-file-a-workers-comp-claim/">how to file a workers’ comp claim in Virginia</a>.</p>`,
      },
      {
        id: 'medical',
        h2: 'How Long Medical Care Stays Open',
        html: `
          <p><strong>Once you have an award for medical benefits, the employer must provide necessary medical care for the injury “as long as necessary after an accident,” with no set number of weeks (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter6/section65.2-603/">Va. Code § 65.2-603</a>).</strong> The Court of Appeals of Virginia has said these medical benefits “can last for a lifetime,” and that the 24-month change-in-condition deadline applies to compensation, not to medical care (<a href="https://www.vacourts.gov/opinions/opncavwp/0818112.pdf">a published Court of Appeals decision involving Bullock Corp., No. 0818-11-2 (Va. Ct. App. Dec. 20, 2011)</a>).</p>
          <p>So a worker who hasn’t seen the doctor for the injury in years can usually go back for treatment under the same award. The insurance company is still required to pay only for care that is reasonable, necessary, and causally related to the accident. That doesn’t mean it will. Years later, the usual fight is over cause: the insurer says the new problem is age or arthritis, not the old injury. If it refuses, you can ask the Commission for a hearing.</p>`,
      },
      {
        id: 'reopen',
        h2: 'How to Reopen a Claim for a Change in Condition',
        html: `
          <p><strong>If your wage checks stopped and your injury later gets worse, you can ask the Commission to review your award based on a change in condition, within 24 months from the last day for which you were paid compensation under an award (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/">Va. Code § 65.2-708</a>).</strong> For permanent partial disability benefits, the period is 36 months.</p>
          <p>Common reasons to reopen:</p>
          <ul>
            <li>Your doctor takes you back out of work, for example for a new surgery.</li>
            <li>Your restrictions get worse and you can no longer do your light-duty job.</li>
            <li>You lose a light-duty job and can’t find other work within your restrictions.</li>
            <li>Your doctor raises your permanent rating.</li>
          </ul>
          <p>To reopen, you file a claim for the new benefits with the Commission, supported by medical evidence that the change is from the work injury. The Commission can’t award additional wage benefits for any period more than 90 days before the date you file the change-in-condition claim (<a href="https://law.lis.virginia.gov/admincode/title16/agency30/chapter50/section20/">Commission Rule 1.2</a>). So waiting to file can cost weeks of checks even when you are inside the 24 months.</p>
          <p>Wages can extend this clock. If the work injury physically keeps you from going back to your old job, and you are given work within your restrictions at the same or higher pay, those wages count as compensation paid under an award for up to 24 consecutive months. That pushes back the date the deadline starts running, and those weeks don’t count against your 500 weeks (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/">Va. Code § 65.2-708(C)</a>).</p>
          <p>Two less common exceptions: if no wage benefits were ever paid, a permanent partial disability award can still be made within 36 months of the accident, and surgery to repair or replace a prosthesis or orthosis starts a new 24-month period (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/">Va. Code § 65.2-708</a>).</p>
          <p>Miss the deadline, and the Commission can’t award more wage benefits under that award, even if your condition has plainly changed. Medical care under the award continues. More on <a href="/light-duty-workers-comp-virginia/">light duty and losing a light-duty job</a>.</p>`,
      },
      {
        id: 'close',
        h2: 'What Closes a Workers’ Comp Claim',
        html: `
          <p>Most claims close in one of these ways:</p>
          <ul>
            <li><strong>A full and final settlement.</strong> One lump sum, approved by the Commission, that ends wage benefits and future medical care for the injury. You cannot come back for more. A settlement is optional; nobody can force you to settle (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-701/">§ 65.2-701</a>).</li>
            <li><strong>Wage benefits end and the deadline passes.</strong> The award for medical care can stay open, but wage checks can’t be reopened after the 24 months (or 36 months for permanent partial disability).</li>
            <li><strong>The 500-week limit.</strong> Wage benefits end when they reach the limit, except in cases of permanent and total incapacity (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter5/section65.2-518/">§ 65.2-518</a>).</li>
            <li><strong>The claim was never filed in time.</strong> Without a timely claim or an exception, there is no claim to keep open.</li>
          </ul>
          <p>Here’s more on <a href="/workers-comp-settlement-in-virginia/">workers’ comp settlements in Virginia</a>.</p>`,
      },
      {
        id: 'questions',
        h2: 'Questions About How Long a Claim Stays Open',
        html: `
          <h3>Does a Workers’ Comp Claim Close When I Go Back to Work?</h3>
          <p>No. Your wage checks may stop, but an award for medical care stays open as long as treatment is necessary. The 24-month clock to reopen wage benefits starts from the last day you were paid compensation under an award. If you went back to lighter work at the same or higher pay, those wages can count as compensation for up to 24 months, which moves that start date later.</p>
          <h3>Can I Reopen a Workers’ Comp Claim After I Settled?</h3>
          <p>Generally not. A full and final settlement approved by the Commission closes the benefits it covers, including future medical care.</p>
          <h3>Can the Insurance Company Close My Claim?</h3>
          <p>Not on its own say-so once you have an award. To stop or reduce wage checks under an award, it has to file an application with the Commission, and you get a chance to respond (<a href="https://law.lis.virginia.gov/vacode/title65.2/chapter7/section65.2-708/">Va. Code § 65.2-708</a>). Here’s what to do <a href="/what-if-a-workers-comp-insurer-delays-my-benefits/">if the insurer delays or stops your benefits</a>.</p>`,
      },
    ],
    closing: {
      h2: 'Talk to Pathfinder Injury Law About Your Claim',
      html: `
        <p>Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call ${phone} or fill out the <a href="#contact">contact form</a>.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  settleDispute: {
    path: '/virginia-work-injury-lawyer/how-to-settle-a-virginia-workers-comp-dispute/',
    title: "How To Settle Virginia's Workers Comp Dispute | Need To Know",
    // Live: "after a work injury or illness".
    description:
      "Pathfinder Injury Law helps employees get compensation after a work injury. Here's how to settle Virginia workers’ comp disputes.",
    h1: 'How to Settle a Virginia Workers’ Comp Dispute',
    crumb: 'Settle a Workers’ Comp Dispute',
    parents: [{ name: 'Virginia Work Injury Lawyer', path: '/virginia-work-injury-lawyer/' }],
    lead: `
      <p class="lead">A single mistake or distraction on the job can leave you hurt and suffering. Your Workers’ Comp benefits are supposed to protect you and compensate you when this happens, but you may not have much luck getting your compensation.</p>
      <p>Here are the steps to settle a Virginia <a href="${WC}">Workers’ Comp</a> dispute, whether your claim was denied or the insurance company is fighting part of it.</p>
      <p>A settlement is optional. Nobody can force you to settle. Settlement ends the benefits it covers, and the Commission must approve all settlements.</p>`,
    sections: [
      {
        id: 'reason',
        h2: 'Find Out Why Your Claim Is Disputed',
        // Live heading: "Seek a Hearing About Your Dispute" (the section is about the first step, talking
        // to the insurer). Live said "ten days to report" an injury; replaced with the reviewed
        // thirty-day notice and two-year filing wording.
        html: `
          <p>Your first step is to find out the insurance company’s reason for the denial or the dispute.</p>
          <p>Once you know the reasons for your denial, you can focus on disputing those reasons. For example, your employer may claim you didn’t <a href="https://workcomp.virginia.gov/sites/default/files/documents/Reporting-an-Accident_0.pdf" rel="noopener">give notice or file your claim in time</a> to receive compensation. In Virginia, the Workers’ Compensation Act requires notice to your employer within thirty days of the accident, and your claim must be on file with the Commission within two years of your date of accident, although exceptions apply. In this case, you may focus on proving you met those deadlines.</p>`,
      },
      {
        id: 'hearing',
        h2: 'Request a Hearing Before the Commission',
        // Live heading: "Take Your Claim to Court". The Commission is not a court, and the reviewed
        // wording is "hearing before the Commission". LIVE WORDING kept: mediation sentence.
        html: `
          <p>Some disputes go to mediation. Mediations are settlement conferences with the insurance company and a deputy commissioner who acts as the mediator, often to try to reach a lump sum settlement. The deputy commissioner who mediates your case is not the one who decides it.</p>
          <p>But <a href="https://workcomp.virginia.gov/content/alternative-dispute-resolution-adr" rel="noopener">mediation for you</a> and your employer may not work in every case. Even with evidence that you are <a href="https://workcomp.virginia.gov/sites/default/files/documents/Injured-Worker-Benefits-Guide_0.pdf" rel="noopener">due benefits</a>, the insurance company and your employer may continue to refuse your compensation.</p>
          <p>When you’re hurt in a serious work accident, you don’t have to settle for less or move on after a refusal. You may instead <a href="https://workcomp.virginia.gov/hearing-locations" rel="noopener">request a hearing</a> before the Virginia Workers’ Compensation Commission. There, you present evidence that you’re due Workers’ Comp benefits. At the hearing, a deputy commissioner hears the evidence and decides whether benefits are due.</p>`,
      },
    ],
    closing: {
      h2: 'Stuck in a Workers’ Comp Dispute?',
      // Live: "your lawyer can fight for your claim in the courtroom, guiding you to compensation".
      html: `
        <p>Pathfinder Injury Law handles only Virginia workers’ compensation claims, and <a href="/bryn-swartz/">Bryn Swartz</a> has taken part in hundreds of mediations. Call ${phone} or <a href="#contact">use the contact form</a> on this page.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  lumpSum: {
    path: '/should-i-accept-a-lump-sum-settlement-for-my-workers-comp-claim/',
    title: 'Lump Sum Work Comp Claim Settlements vs Other Settlements',
    description:
      "Should you accept a lump sum workers' comp settlement in Virginia? What it closes, Medicare set-asides, and what to answer before you say yes.",
    h1: 'Should I Accept a Lump Sum Settlement for My Workers’ Comp Claim?',
    crumb: 'Lump Sum Settlement',
    lead: `
      <p class="lead">When you’re hurt in a work accident, you may have the option to take a lump sum settlement for your Workers’ Comp claim. A lump sum settlement means you may receive the benefits for your claim at once. But is it the best option for your Workers’ Comp claim?</p>
      <p>If you’re <a href="${WC}">seeking Workers’ Comp</a> benefits, here’s how a lump sum compares with other settlements and what to weigh first.</p>
      <p>A settlement is optional. Nobody can force you to settle. Settlement ends the benefits it covers, and the Commission must approve all settlements.</p>`,
    sections: [
      {
        id: 'difference',
        h2: 'What’s the Difference Between a Lump Sum and Other Settlements?',
        // Live: "To settle your claim in this way, your injuries must be permanent and stable" (with an
        // SSA link). No reviewed equivalent, so it is left out. The two settlement types below use the
        // reviewed Workers' Comp page wording.
        html: `
          <p>After a serious work injury, you may want to have your Virginia Workers’ Comp benefits in one lump sum. In these cases, you’ll receive your benefits at one time, rather than receiving weekly payments for your injuries. Some workers may choose this option to personally manage their funds and have more control over their funds.</p>
          <h3>Lump Sum Settlement With Open Medical Payments</h3>
          <p>It is exceedingly rare to settle a case for a lump sum with open medicals. Typically, cases settle top to bottom.</p>
          <h3>Full and Final Settlement</h3>
          <p>You may also choose to receive a one-time payment to resolve your workers’ comp claim, with the understanding that you may not bring any future claims in relation to your injury. A full and final settlement is an arrangement in which you agree to take a lump sum of money to close out your entire case, top to bottom, with no future benefit entitlement of any kind whatsoever, whether for wage loss, medical bills, vocational rehab, permanent partial disability benefits, or any other benefits. Settling your case closes everything and ends benefits.</p>`,
      },
      {
        id: 'should-i',
        h2: 'Should I Accept a Lump Sum Settlement?',
        html: `
          <p>On-the-job injuries can be complex and difficult to judge. That traumatic head injury may feel fine now, but you may suffer health complications shortly thereafter. Because you may need future benefits, keep in mind that settling your case closes everything and ends benefits.</p>
          <p>Questions to answer before you say yes:</p>
          <ul>
            <li><strong>Will you need more treatment?</strong> A full and final settlement closes your medical benefits for good. Workers’ comp no longer pays for surgery, therapy, or prescriptions for the injury.</li>
            <li><strong>Are you on Medicare, or likely to be within 30 months?</strong> Then Medicare’s interests have to be considered, and part of the money may need to go into a <a href="/workers-comp-settlement-in-virginia/#medicare">Medicare set-aside</a>.</li>
            <li><strong>Can you go back to your old job?</strong> If not, remember that the settlement also ends wage loss and vocational rehab benefits.</li>
            <li><strong>Has your doctor rated any permanent loss of use?</strong> Permanent partial disability benefits end with the settlement too. Here’s <a href="/impairment-rating-virginia-workers-comp/">how impairment ratings work</a>.</li>
          </ul>
          <p>If you don’t settle, your claim continues and you can still ask for a <a href="https://www.workcomp.virginia.gov/sites/default/files/documents/Claims-and-Hearings-Flow-Chart.pdf" rel="noopener">Virginia Workers’ Comp hearing</a> on any benefit in dispute, as long as the deadline for that benefit hasn’t passed.</p>`,
      },
    ],
    closing: {
      h2: 'Weighing a Settlement Offer?',
      html: `<p>A settlement is binding once the Commission approves it. <a href="/">Pathfinder Injury Law</a> handles only Virginia workers’ compensation claims. Call ${phone} or <a href="#contact">use the contact form</a> on this page.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  strengthenCase: {
    path: '/how-to-win-a-virginia-workers-comp-case/',
    // Live title "Guide to Winning Your First Workers' Compensation Case", live H1 "How to Win Your
    // Virginia Workers' Comp Case" and a description that said "Win your Virginia workers'
    // compensation case". Those read as outcome promises, so the wording is softened. Address kept.
    // Needs Bryn's OK: this changes the live title and H1 of a page that has search traffic.
    title: "Guide to Strengthening Your First Workers' Compensation Case",
    description:
      "Learn the steps that can help your Virginia workers' compensation claim with Pathfinder Injury Law. Discuss your benefits - call 804-505-0633.",
    h1: 'How to Strengthen Your Virginia Workers’ Comp Case',
    crumb: 'Strengthen Your Workers’ Comp Case',
    lead: `
      <p class="lead">A work accident can leave you struggling with debts, a lack of income, and strain on your family. When this happens, you need to get compensated fairly and get your Virginia Workers’ Comp benefits. The insurance company may not be so willing to help you do that.</p>
      <p>But don’t worry, Pathfinder Injury Law can guide you through the steps that matter most in a Virginia Workers’ Comp case. Continue reading to learn more about how to build a strong Virginia Workers’ Comp claim.</p>
      <p>Not every case is winnable, and we are not guaranteeing results.</p>`,
    sections: [
      {
        id: 'treatment',
        h2: 'Seek Medical Treatment',
        // LIVE WORDING: "employer's chosen doctor ... They get to choose the doctors they cover". No
        // reviewed equivalent; Commission link kept as on live. Needs Bryn's review.
        html: `
          <p>If you’ve been injured on the job, your first step is to seek medical care. Yes, you need it, even if you feel fine. You may not notice a serious injury until it’s worsened, and the insurance company may doubt your claim if you don’t act immediately.</p>
          <p>Your employer must offer a <a href="https://workcomp.virginia.gov/content/medical-providers" rel="noopener">panel of at least three doctors</a>, and you choose one. If your claim is denied, you can generally choose your own doctor instead.</p>`,
      },
      {
        id: 'file',
        h2: 'File a Virginia Workers’ Comp Case on Time',
        // Live: "You have only two years to file".
        html: `
          <p>It can be tough to file a Workers’ Comp claim on time when you’re hurt. You may be stuck in the hospital for days or weeks, recovering from your injuries. But to make your claim stronger, it’s important to act as soon as possible. Start by giving written notice of your injury to your employer within thirty days of the accident.</p>
          <p>Your claim must also be on file with the <a href="https://www.workcomp.virginia.gov/sites/default/files/documents/Injured-Worker-FAQs_1.pdf" rel="noopener">Virginia Workers’ Compensation Commission</a> within two years of your date of accident, although exceptions apply. Acting now can protect your claim and help you get your benefits sooner. That means less time worrying about how you’ll feed your family, and more time focusing on your health.</p>`,
      },
      {
        id: 'evidence',
        h2: 'Gather Evidence',
        html: `
          <p>If the insurance company has any doubts about your claim, you may be denied Workers’ Comp benefits at first. But don’t panic. You’re not out of options to get compensated for your work injuries. Your Workers’ Comp lawyer in Virginia can gather evidence that supports your claim.</p>
          <p>For example, your work-related vision loss may be keeping you from returning to work, but the Workers’ Comp insurance company claims otherwise. Your lawyer can help compile doctor’s reports and expert medical testimony to support your claim.</p>`,
      },
    ],
    closing: {
      h2: 'Connect with a Virginia Work Comp Lawyer',
      html: `
        <p>When you’re hurt in a work accident, getting your Virginia Workers’ Comp benefits can be difficult, but you can make it easier with a lawyer from <a href="/">Pathfinder Injury Law</a>. We can walk you through these steps, starting with a free consultation. Call <a href="tel:+18045050633">804-505-0633</a> or fill out the online <a href="#contact">contact form</a> to get started.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  process: {
    path: '/workers-comp-process-in-virginia/',
    title: 'How Does The Workers Comp Process Work in Virginia?',
    description:
      'Pathfinder Injury Law is here to help with work-related accidents. Learn more about the Virginia workers’ compensation claim process.',
    h1: 'Virginia Workers’ Compensation Process',
    lead: `
      <p class="lead">Injured in a <a href="/virginia-work-injury-lawyer/">work-related accident</a>? Is that injury now presenting you with long-term issues that prevent you from returning to work? Don’t worry. Virginia state law has a legal avenue for you to seek financial compensation for your losses. The Workers’ Comp process is a legal procedure that allows an employee to recoup money if they’re hurt at work. However, it’s not always easy. That’s why state law also allows injured employees to consult an attorney about their <a href="/how-to-file-a-workers-comp-claim/">claims</a>. Pathfinder Injury Law can help you understand the Workers’ Compensation process and the procedures that govern filing a claim.</p>`,
    sections: [
      {
        id: 'claim-process',
        h2: 'Learn More About the VA Workers’ Compensation Claim Process',
        // Live: "every employer with more than two employees"; reviewed wording used. "Vocational
        // rehabilitation" is LIVE WORDING (no reviewed equivalent; city pages kept it too).
        html: `
          <p>Virtually all employers with three or more employees regularly in service in Virginia are required to carry workers’ compensation insurance. If an employee receives an injury while completing their job-related duties, they can file a claim with the Virginia Workers’ Compensation Commission to seek benefits including reimbursement of costs. Employees can use the Workers’ Comp process to apply for several financial benefits including:</p>
          <ul>
            <li>Lost wages</li>
            <li>Medical benefits</li>
            <li>Vocational rehabilitation</li>
            <li>Permanent loss of use</li>
            <li>Permanent total disability</li>
          </ul>`,
      },
      {
        id: 'procedure',
        h2: 'The Workers’ Compensation Procedure',
        // LIVE WORDING: the seven-step list (panel of doctors, discovery, appealing a decision) has no
        // reviewed equivalent. The closing paragraph is rewritten: live said a missed 30-day report
        // means you "lose your ability to claim benefits" and called the two-year filing deadline an
        // appeal deadline, and said "Our professional help can increase your chances of winning your
        // claim and receiving the maximum benefits".
        html: `
          <p>When you file a Workers’ Comp claim, there’s a specific process you’ll need to follow. This includes:</p>
          <ul>
            <li>Informing your employer about your <a href="${WC}">workplace injury</a></li>
            <li>Asking for a panel of doctors to see for your injured body part</li>
            <li>Filing a claim with the Virginia Workers’ Compensation Commission for benefits</li>
            <li>Agreeing to benefits with the Workers’ Compensation insurance carrier OR having your claim denied by work comp officials</li>
            <li>Interacting in the discovery process, including depositions</li>
            <li>Going to hearing or settling your case</li>
            <li>Appealing the decision if not in your favor at hearing</li>
          </ul>
          <p>If you don’t follow the correct procedure when you pursue your <a href="${WC}">Workers’ Compensation claim in Virginia</a>, you may lose your case on a technicality. For example, the Virginia Workers’ Compensation Act requires notice to your employer within thirty days of the accident, although exceptions exist, and failing to do so could affect your ability to receive benefits. Your claim must also be on file with the Commission within two years of your date of accident, although exceptions apply. It’s easy to miss these kinds of deadlines. That’s where we can help. <a href="/">Pathfinder Injury Law</a> has years of experience helping our clients pursue their claims. We can leverage that experience to help you pursue yours. Call ${phone} for your no-obligation consultation.</p>`,
      },
    ],
    closing: {
      h2: 'Talk to Us About Your Claim',
      html: `<p>Not sure where you are in the process? Call ${phone} or <a href="#contact">fill out the online form</a> for a free, no-obligation consultation.</p>`,
    },
  },

  // ---------------------------------------------------------------------------------------------
  settlement: {
    path: '/workers-comp-settlement-in-virginia/',
    title: 'Workers’ Comp Settlement in Virginia - Pathfinder Injury Law',
    description:
      "How Virginia workers' comp settlements work: full and final or open medical, Medicare set-asides, and why there's no honest average.",
    h1: 'Workers’ Comp Settlement in Virginia',
    lead: `
      <p class="lead">When you’ve been injured, you know you’ll likely have to file a Workers’ Comp claim. Many people wonder what the average Workers’ Compensation settlement is, and how a <a href="${WC}">Virginia workers’ comp</a> settlement works. Here’s what to know.</p>
      <p>A settlement is optional. Nobody can force you to settle. Settlement ends the benefits it covers, and the Commission must approve all settlements.</p>`,
    sections: [
      {
        id: 'types',
        h2: 'What Types of Workers’ Compensation Settlements Are There?',
        // Live listed four types, including a structured settlement (removed per Bryn). The "full and
        // final" and "open medical" descriptions use the reviewed Workers' Comp page wording. The live
        // Medicare set-aside bullet was removed earlier; the Medicare section below copies the wording
        // Bryn approved on /work-injury-compensation/ (Oct 31, checked against the CMS WCMSA Reference Guide).
        html: `
          <p>Common types of Workers’ Compensation settlements include:</p>
          <ul>
            <li><strong>Full and Final Settlement:</strong> A one-time payment to resolve your workers’ comp claim, with the understanding that you may not bring any future claims in relation to your injury. You agree to take a lump sum of money to close out your entire case, with no future benefit entitlement of any kind, whether for wage loss, medical bills, vocational rehab, permanent partial disability benefits, or any other benefits. Typically, cases settle this way, top to bottom. Settling your case closes everything and ends benefits.</li>
            <li><strong>Lump Sum Settlement With Open Medical Benefits:</strong> It is exceedingly rare to settle a case for a lump sum with open medicals.</li>
          </ul>
          <p>To learn more, read <a href="/should-i-accept-a-lump-sum-settlement-for-my-workers-comp-claim/">Should I Accept a Lump Sum Settlement?</a></p>`,
      },
      {
        id: 'medicare',
        h2: 'Settlements When Medicare Is Involved',
        html: `
          <p>Not every settlement needs a <strong>Workers’ Compensation Medicare Set-Aside</strong>. The question comes up when you are already on Medicare, or have a reasonable expectation of getting on Medicare within 30 months, for example because you have applied for Social Security Disability or are 62 and a half. Medicare will review a proposed set-aside only when the settlement is over certain amounts: $25,000 if you are on Medicare, or $250,000 if you expect to be. Medicare says those amounts reflect its own workload, not a safe zone, and that its interests have to be considered in every settlement (<a href="https://www.cms.gov/medicare/coordination-benefits-recovery/workers-comp-set-aside-arrangements" rel="noopener">CMS WCMSA Reference Guide</a>).</p>
          <p>When there is a set-aside, part of the settlement goes into a separate, interest-bearing account that can be used only for Medicare-covered treatment of the work injury. The insurance company funds it as part of the settlement. A professional administrator can manage it, but often you are the one who has to: paying the bills from it, keeping records, and sending Medicare a yearly accounting. Medicare won’t pay for treatment related to the work injury until that money is used up, and used properly. Spend it on anything else, and Medicare can refuse to pay for work-injury care until the full amount is accounted for. More on <a href="/work-injury-compensation/">how much compensation you can get for a work injury</a>.</p>`,
      },
      {
        id: 'average',
        h2: 'What Is the Average Workers’ Compensation Settlement?',
        // Live: "We're compassionate, honest, and skilled at what we do." ("skilled" left out).
        html: `
          <p>There isn’t an honest average. The amount has to account for future medical care and lost earning power, because after a full and final settlement you cannot come back for more. Those depend on your injury, your wages, and your treatment, and they take time to know.</p>
          <blockquote><p>“On the first call, I won’t guess what your case is worth. I don’t know anything about it yet. Any lawyer who puts a number on it that early is making it up.” (Bryn Swartz)</p></blockquote>
          <p>More on <a href="/virginia-workers-comp-lawyer/how-to-calculate-a-virginia-workers-comp-settlement/">how a settlement is calculated</a>.</p>`,
      },
    ],
    closing: {
      h2: 'Thinking About Settling Your Workers’ Comp Claim?',
      html: `<p>Settling your case closes everything and ends benefits. Pathfinder Injury Law handles only Virginia workers’ compensation claims. Call ${phone} or <a href="#contact">use the contact form</a> on this page.</p>`,
    },
  },
} satisfies Record<string, ArticleB>;
