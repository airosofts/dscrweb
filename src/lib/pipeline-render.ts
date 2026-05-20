/**
 * Template rendering for the pipeline processor.
 *
 * Thin wrapper around the lower-level helpers in @/lib/pipeline so the
 * processor route gets the exact signature it expects.
 */

import {
  buildLeadVars as buildVars,
  renderTemplate,
  type TemplateVars,
} from "@/lib/pipeline";

export type ProcessorLead = {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  unsubscribe_token: string;
};

/** Build the allowlisted variable block for a lead. */
export function buildLeadVars(
  req: ProcessorLead,
  _baseUrl: string,
  pipelineEmailId: string,
): TemplateVars {
  return buildVars({
    pipelineEmailId,
    advertisingRequestId: req.id,
    contactPerson: req.contact_person,
    companyName: req.company_name ?? "",
    email: req.email,
    unsubscribeToken: req.unsubscribe_token,
  });
}

/** Render a template by subject + html strings (variables substituted, tracking applied). */
export function renderEmail(opts: {
  subjectTemplate: string;
  htmlTemplate: string;
  vars: TemplateVars;
  baseUrl: string;
  pipelineEmailId: string;
}): { subject: string; html: string } {
  const rendered = renderTemplate(
    {
      id: "",
      slug: "",
      subject: opts.subjectTemplate,
      preview: null,
      html: opts.htmlTemplate,
    },
    opts.vars,
    { baseUrl: opts.baseUrl, pipelineEmailId: opts.pipelineEmailId },
  );
  return { subject: rendered.subject, html: rendered.html };
}
