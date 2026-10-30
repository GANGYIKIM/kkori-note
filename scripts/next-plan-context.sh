#!/bin/sh
# /next-plan에 미리 넣을 내용: plan.md와 R 문서들 (ADR-0006)
cd "$(dirname "$0")/.." || exit 0

echo "## docs/plan.md"
if [ -f docs/plan.md ]; then cat docs/plan.md; else echo "(없음)"; fi

echo
echo "## R 문서"
found=0
for f in docs/dev-log/R*/README.md; do
  [ -f "$f" ] || continue
  found=1
  echo "### $f"
  cat "$f"
done
[ "$found" -eq 1 ] || echo "(없음)"
exit 0
