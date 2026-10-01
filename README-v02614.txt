Mealie PUT/DELETE readiness fix, generator v0.26.14.

When a documented POST returns an ID compatible with the final item path parameter, the generated long-interleaving story uses the returned ID for that parameter, then confirms item GET before InstanceReady. No server behavior is presumed from a success code alone. The next experiment still requires a live overlap and a serial-control verdict.

After expanding into the existing project root:
  python -m unittest discover -s .\tests -p test_mealie_response_path_binding.py
  python -m unittest discover -s .\tests -p test_mealie_next_stages.py
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch mealplan-put-delete -BaseSeed 20261823 -PreflightOnly
  & .\scripts\Invoke-Mealie-NextStages.ps1 -Branch mealplan-put-delete -BaseSeed 20261823

This overlay changes only the four files listed above plus this README. It does not delete the preserved failed-run volume.
