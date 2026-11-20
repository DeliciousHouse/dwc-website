"""Run with Python Playwright and Chrome: python tests/browser/cookie-footer.py <preview-origin>."""

import sys
import unittest

from playwright.sync_api import expect, sync_playwright


class CookieFooterTest(unittest.TestCase):
    def test_policy_links_work_without_a_cookie_choice(self):
        with sync_playwright() as playwright, playwright.chromium.launch(channel="chrome") as browser:
            for width, height in ((1440, 900), (390, 844)):
                for path, label, heading in (
                    ("/terms", "Terms", "Terms of Service"),
                    ("/privacy", "Privacy", "Privacy Policy"),
                ):
                    with self.subTest(viewport=(width, height), path=path):
                        page = browser.new_page(viewport={"width": width, "height": height})
                        try:
                            page.set_default_timeout(5_000)
                            self.check_link(page, height, path, label, heading)
                        finally:
                            page.context.close()

    def check_link(self, page, height, path, label, heading):
        response = page.goto(origin, wait_until="domcontentloaded", timeout=30_000)
        self.assertEqual(response.status, 200)
        page.get_by_role("button", name="Yes, I’m 21+").click()
        panel = page.get_by_role("region", name="Cookie preferences")
        expect(panel).to_be_visible()
        self.assertEqual(panel.evaluate("el => el.getBoundingClientRect().bottom"), height)
        page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
        footer = page.get_by_role("contentinfo")
        footer_clear = footer.evaluate("""el => el.getBoundingClientRect().bottom <=
            document.querySelector('[aria-label="Cookie preferences"]').getBoundingClientRect().top + 1""")
        link = footer.get_by_role("link", name=label, exact=True)
        point = link.evaluate("""el => {
            const {x, y, width, height} = el.getBoundingClientRect();
            return {x: x + width / 2, y: y + height / 2};
        }""")
        self.assertTrue(link.evaluate("(el, {x, y}) => el.contains(document.elementFromPoint(x, y))", point),
                        f"Footer {label} link is not reachable at the bottom of the page")
        page.mouse.click(point["x"], point["y"])
        expect(page).to_have_url(origin + path)
        expect(page.get_by_role("heading", name=heading, exact=True)).to_be_visible()
        expect(panel).to_be_visible()
        for option in ("Analytics cookies", "Advertising cookies"):
            expect(panel.get_by_role("checkbox", name=option)).not_to_be_checked()
        self.assertNotIn("dw_cookie_consent", {cookie["name"] for cookie in page.context.cookies()})
        self.assertTrue(footer_clear, "Cookie panel overlaps the footer at maximum scroll")


if __name__ == "__main__":
    origin = sys.argv.pop(1).rstrip("/")
    unittest.main()
