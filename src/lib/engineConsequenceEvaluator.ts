import {ResolvedConsequence, Context, RuleConsequence, RuleConsequenceMessagePart} from '../types';
import {getFromPath} from './helpers';

export const evaluateEngineConsequence = async <ConsequencePayload, C extends Context, Ignore = never>
(context: C, consequence: RuleConsequence<ConsequencePayload, C, Ignore>)
  : Promise<ResolvedConsequence<ConsequencePayload>> => {
  let messageParts: RuleConsequenceMessagePart<C, Ignore>[];
  if (typeof consequence.message === 'string') {
    messageParts = [consequence.message];
  } else {
    messageParts = consequence.message;
  }
  return {
    message: messageParts.map<string>((msgPart: RuleConsequenceMessagePart<C, Ignore>): string => {
      if (typeof msgPart === 'string') {
        return msgPart;
      }
      const {value, exists} = getFromPath(context, msgPart.ref);
      if (!exists) {
        throw new Error(`Invalid consequence ref - unknown context key ${msgPart.ref}`)
      }
      return String(value);
    }).join(' '),
    custom: consequence.custom,
  }
}
