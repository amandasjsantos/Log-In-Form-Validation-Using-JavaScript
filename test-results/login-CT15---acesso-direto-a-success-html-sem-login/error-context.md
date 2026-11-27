# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> CT15 - acesso direto a success.html sem login
- Location: tests/login.spec.js:133:1

# Error details

```
Error: expect(locator).not.toContainText(expected) failed

Locator: locator('h1')
Expected substring: not "Congratulations"
Received string: "  Congratulations, You have entered the corect credentials !!  "
Timeout: 5000ms

Call log:
  - Expect "not toContainText" locator('h1') with timeout 5000ms
  - waiting for locator('h1')
    14 × locator resolved to <h1>…</h1>
       - unexpected value "  Congratulations, You have entered the corect credentials !!  "

```

```yaml
- heading "Congratulations, You have entered the corect credentials !!" [level=1]
```

# Test source

```ts
  36  |   await login(page, OK.user, 'errada');
  37  |   await expect(page).not.toHaveURL(/success\.html/);
  38  |   expect(msgs[0]).toContain('2 attempts left');
  39  | });
  40  | 
  41  | test('CT03 - usuário incorreto', async ({ page }) => {
  42  |   const msgs = await abrir(page);
  43  |   await login(page, 'Outro', OK.pass);
  44  |   await expect(page).not.toHaveURL(/success\.html/);
  45  |   expect(msgs[0]).toContain('2 attempts left');
  46  | });
  47  | 
  48  | test('CT04 - usuário e senha incorretos', async ({ page }) => {
  49  |   const msgs = await abrir(page);
  50  |   await login(page, 'x', 'y');
  51  |   await expect(page).not.toHaveURL(/success\.html/);
  52  |   expect(msgs[0]).toContain('2 attempts left');
  53  | });
  54  | 
  55  | test('CT05 - campos vazios', async ({ page }) => {
  56  |   const msgs = await abrir(page);
  57  |   await login(page, '', '');
  58  |   await expect(page).not.toHaveURL(/success\.html/);
  59  |   expect(msgs.length).toBeGreaterThan(0);
  60  | });
  61  | 
  62  | test('CT06 - só usuário', async ({ page }) => {
  63  |   await abrir(page);
  64  |   await login(page, OK.user, '');
  65  |   await expect(page).not.toHaveURL(/success\.html/);
  66  | });
  67  | 
  68  | test('CT07 - só senha', async ({ page }) => {
  69  |   await abrir(page);
  70  |   await login(page, '', OK.pass);
  71  |   await expect(page).not.toHaveURL(/success\.html/);
  72  | });
  73  | 
  74  | test('CT08 - 2 erros e depois acerto', async ({ page }) => {
  75  |   await abrir(page);
  76  |   await login(page, 'x', 'y');
  77  |   await login(page, 'x', 'y');
  78  |   await expect(page.locator('#submit')).toBeEnabled();
  79  |   await login(page, OK.user, OK.pass);
  80  |   await expect(page).toHaveURL(/success\.html/);
  81  | });
  82  | 
  83  | test('CT09 - 3ª tentativa errada bloqueia tudo', async ({ page }) => {
  84  |   const msgs = await abrir(page);
  85  |   await tresErros(page);
  86  |   expect(msgs[2]).toContain('0 attempts left');
  87  |   await expect(page.locator('#username')).toBeDisabled();
  88  |   await expect(page.locator('#password')).toBeDisabled();
  89  |   await expect(page.locator('#submit')).toBeDisabled();
  90  | });
  91  | 
  92  | test('CT10 - estado após o bloqueio', async ({ page }) => {
  93  |   const msgs = await abrir(page);
  94  |   await tresErros(page);
  95  |   await expect(page.locator('#submit')).toBeDisabled();
  96  |   await expect(page).not.toHaveURL(/success\.html/);
  97  |   expect(msgs.length).toBe(3);
  98  | });
  99  | 
  100 | test('CT11 - bloqueio deveria persistir ao recarregar', async ({ page }) => {
  101 |   await abrir(page);
  102 |   await tresErros(page);
  103 |   await page.reload();
  104 |   // Esperado correto: continuar bloqueado.
  105 |   await expect(page.locator('#username')).toBeDisabled();
  106 | });
  107 | 
  108 | test('CT12 - texto muito longo', async ({ page }) => {
  109 |   const msgs = await abrir(page);
  110 |   const longo = 'a'.repeat(500);
  111 |   await login(page, longo, longo);
  112 |   await expect(page).not.toHaveURL(/success\.html/);
  113 |   expect(msgs[0]).toContain('2 attempts left');
  114 | });
  115 | 
  116 | test('CT13 - maiúsculas e espaço no fim', async ({ page }) => {
  117 |   await abrir(page);
  118 |   await login(page, 'PATWAN', OK.pass);
  119 |   await expect(page).not.toHaveURL(/success\.html/);
  120 |   await login(page, 'Patwan ', OK.pass);
  121 |   await expect(page).not.toHaveURL(/success\.html/);
  122 | });
  123 | 
  124 | test('CT14 - caracteres especiais não executam código', async ({ page }) => {
  125 |   const msgs = await abrir(page);
  126 |   await login(page, '<script>alert(1)</script>', 'x');
  127 |   await login(page, "' OR '1'='1", "' OR '1'='1");
  128 |   await expect(page).not.toHaveURL(/success\.html/);
  129 |   // Todo alert deve ser só o de tentativas; um alert "1" indicaria XSS.
  130 |   for (const m of msgs) expect(m).toMatch(/attempts left/);
  131 | });
  132 | 
  133 | test('CT15 - acesso direto a success.html sem login', async ({ page }) => {
  134 |   await page.goto('/success.html');
  135 |   // Esperado correto: não mostrar a página de sucesso sem login.
> 136 |   await expect(page.locator('h1')).not.toContainText('Congratulations');
      |                                        ^ Error: expect(locator).not.toContainText(expected) failed
  137 | });
  138 | 
  139 | test('CT16 (extra) - reativar campos após bloqueio não deveria logar', async ({ page }) => {
  140 |   await abrir(page);
  141 |   await tresErros(page);
  142 |   // Simula o usuário reativando os campos pelo DevTools
  143 |   await page.evaluate(() => {
  144 |     for (const id of ['username', 'password', 'submit']) {
  145 |       document.getElementById(id).disabled = false;
  146 |     }
  147 |   });
  148 |   await login(page, OK.user, OK.pass);
  149 |   await expect(page).not.toHaveURL(/success\.html/);
  150 | });
```