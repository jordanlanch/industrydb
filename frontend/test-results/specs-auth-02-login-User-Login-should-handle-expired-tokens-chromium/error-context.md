# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - heading "Sign in" [level=3] [ref=e7]
        - paragraph [ref=e8]: Enter your credentials to access your account
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - text: Email Address
            - textbox "Email Address" [ref=e12]:
              - /placeholder: you@example.com
          - generic [ref=e13]:
            - generic [ref=e14]:
              - generic [ref=e15]: Password
              - link "Forgot password?" [ref=e16] [cursor=pointer]:
                - /url: /forgot-password
            - textbox "Password" [ref=e17]:
              - /placeholder: ••••••••
        - generic [ref=e18]:
          - button "Sign in" [disabled]
          - generic [ref=e23]: Or continue with
          - generic [ref=e24]:
            - button "Google" [ref=e25] [cursor=pointer]:
              - img [ref=e26]
              - text: Google
            - button "GitHub" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
              - text: GitHub
          - paragraph [ref=e34]:
            - text: Don't have an account?
            - link "Sign up" [ref=e35] [cursor=pointer]:
              - /url: /register
```