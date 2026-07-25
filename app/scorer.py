"""Computes the Interest Score from a simulated conversation.
Uses TextBlob sentiment analysis + a keyword signal lexicon.
Fully local — no API calls needed here.
"""
from textblob import TextBlob

from app.models import CandidateProfile, ConversationTurn, InterestResult

# Keywords that signal genuine interest
POSITIVE_SIGNALS = [
    "excited", "exciting", "interested", "love to", "would love",
    "great opportunity", "sounds great", "sounds perfect", "keen",
    "available", "free this week", "happy to", "looking forward",
    "definitely", "absolutely", "enthusiastic", "ideal", "perfect fit",
    "calendar invite", "schedule a call", "when can we",
]

# Keywords that signal low interest or hesitation
NEGATIVE_SIGNALS = [
    "not looking", "not actively", "happy in my current",
    "not in the market", "timing isn't right", "going to pass",
    "not interested", "maybe later", "not right now",
    "focused on my current", "pass for now",
]

# Keywords that signal engagement (asking questions = interested)
INQUIRY_SIGNALS = [
    "what's the", "could you share", "tell me more", "what does",
    "what are the", "compensation", "salary", "remote", "tech stack",
    "team size", "day-to-day", "responsibilities", "culture",
    "when can", "how soon",
]


def _extract_candidate_text(conversation: list) -> str:
    """Get only the candidate's replies from the conversation."""
    return " ".join(
        turn.text for turn in conversation
        if turn.role == "candidate"
    )


def _find_signals(text: str, signal_list: list) -> list:
    """Find which signal phrases appear in the text."""
    text_lower = text.lower()
    return [signal for signal in signal_list if signal in text_lower]


def compute_interest_score(
    candidate: CandidateProfile,
    conversation: list,
) -> InterestResult:
    """
    Compute how interested a candidate is based on their conversation replies.

    Score breakdown:
    - 40% TextBlob sentiment (positive/negative tone)
    - 35% positive signal keywords found
    - 15% inquiry signals (asking questions = engaged)
    - 10% penalty for negative signals
    """
    # Get only what the candidate said
    candidate_text = _extract_candidate_text(conversation)

    if not candidate_text.strip():
        return InterestResult(
            candidate_id=candidate.id,
            interest_score=0.0,
            sentiment_polarity=0.0,
            reasoning="No candidate responses found in conversation.",
        )

    # 1. TextBlob sentiment (-1 to +1, normalize to 0-100)
    blob = TextBlob(candidate_text)
    polarity = blob.sentiment.polarity
    sentiment_score = ((polarity + 1) / 2) * 100  # normalize to 0-100

    # 2. Positive signals
    positive_found = _find_signals(candidate_text, POSITIVE_SIGNALS)
    positive_score = min(100.0, len(positive_found) * 20)

    # 3. Inquiry signals (asking questions = engaged)
    inquiry_found = _find_signals(candidate_text, INQUIRY_SIGNALS)
    inquiry_score = min(100.0, len(inquiry_found) * 25)

    # 4. Negative signals (penalty)
    negative_found = _find_signals(candidate_text, NEGATIVE_SIGNALS)
    negative_penalty = min(80.0, len(negative_found) * 30)

    # 5. Weighted final interest score
    raw_score = (
        0.40 * sentiment_score
        + 0.35 * positive_score
        + 0.15 * inquiry_score
        - 0.10 * negative_penalty
    )
    final_score = max(0.0, min(100.0, raw_score))

    # Build reasoning explanation
    reasoning_lines = [
        f"Interest Score: {final_score:.1f}/100",
        "",
        f"Sentiment (TextBlob): {polarity:+.2f} → {sentiment_score:.1f}/100",
        f"  → Overall tone of candidate replies is "
        f"{'positive' if polarity > 0.1 else 'negative' if polarity < -0.1 else 'neutral'}",
        "",
        f"Positive Signals ({len(positive_found)} found): {positive_score:.1f}/100",
    ]
    if positive_found:
        reasoning_lines.append(f"  ✅ {', '.join(positive_found)}")

    reasoning_lines += [
        "",
        f"Inquiry Signals ({len(inquiry_found)} found): {inquiry_score:.1f}/100",
    ]
    if inquiry_found:
        reasoning_lines.append(f"  💬 {', '.join(inquiry_found)}")

    if negative_found:
        reasoning_lines += [
            "",
            f"Negative Signals ({len(negative_found)} found): -{negative_penalty:.1f}",
            f"  ❌ {', '.join(negative_found)}",
        ]

    return InterestResult(
        candidate_id=candidate.id,
        interest_score=round(final_score, 1),
        sentiment_polarity=round(polarity, 3),
        positive_signals=positive_found,
        negative_signals=negative_found,
        inquiry_signals=inquiry_found,
        engagement_turns=len([t for t in conversation if t.role == "candidate"]),
        conversation=[{"role": t.role, "text": t.text} for t in conversation],
        reasoning="\n".join(reasoning_lines),
    )