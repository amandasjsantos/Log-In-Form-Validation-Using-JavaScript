const { test, expect } = require('@playwright/test');

const OK = { user: 'Patwan', pass: 'github#patwan' };

// Abre a página e guarda as mensagens de alert()
async function abrir(page) {
  const msgs = [];
  page.on('dialog', async (d) => {
    msgs.push(d.message());
    await d.accept();
  });
  await page.goto('/index.html');
  return msgs;
}

async function login(page, user, pass) {
  await page.fill('#username', user);
  await page.fill('#password', pass);
  await page.click('#submit');
}

async function tresErros(page) {
  for (let i = 0; i < 3; i++) await login(page, 'x', 'y');
}

test('CT01 - login válido redireciona', async ({ page }) => {
  const msgs = await abrir(page);
  await login(page, OK.user, OK.pass);
  await expect(page).toHaveURL(/success\.html/);
  expect(msgs[0]).toContain('successfully logged In');
  await expect(page.locator('h1')).toContainText('Congratulations');
});

test('CT02 - senha incorreta', async ({ page }) => {
  const msgs = await abrir(page);
  await login(page, OK.user, 'errada');
  await expect(page).not.toHaveURL(/success\.html/);
  expect(msgs[0]).toContain('2 attempts left');
});

test('CT03 - usuário incorreto', async ({ page }) => {
  const msgs = await abrir(page);
  await login(page, 'Outro', OK.pass);
  await expect(page).not.toHaveURL(/success\.html/);
  expect(msgs[0]).toContain('2 attempts left');
});

test('CT04 - usuário e senha incorretos', async ({ page }) => {
  const msgs = await abrir(page);
  await login(page, 'x', 'y');
  await expect(page).not.toHaveURL(/success\.html/);
  expect(msgs[0]).toContain('2 attempts left');
});

test('CT05 - campos vazios', async ({ page }) => {
  const msgs = await abrir(page);
  await login(page, '', '');
  await expect(page).not.toHaveURL(/success\.html/);
  expect(msgs.length).toBeGreaterThan(0);
});

test('CT06 - só usuário', async ({ page }) => {
  await abrir(page);
  await login(page, OK.user, '');
  await expect(page).not.toHaveURL(/success\.html/);
});

test('CT07 - só senha', async ({ page }) => {
  await abrir(page);
  await login(page, '', OK.pass);
  await expect(page).not.toHaveURL(/success\.html/);
});

test('CT08 - 2 erros e depois acerto', async ({ page }) => {
  await abrir(page);
  await login(page, 'x', 'y');
  await login(page, 'x', 'y');
  await expect(page.locator('#submit')).toBeEnabled();
  await login(page, OK.user, OK.pass);
  await expect(page).toHaveURL(/success\.html/);
});

test('CT09 - 3ª tentativa errada bloqueia tudo', async ({ page }) => {
  const msgs = await abrir(page);
  await tresErros(page);
  expect(msgs[2]).toContain('0 attempts left');
  await expect(page.locator('#username')).toBeDisabled();
  await expect(page.locator('#password')).toBeDisabled();
  await expect(page.locator('#submit')).toBeDisabled();
});

test('CT10 - estado após o bloqueio', async ({ page }) => {
  const msgs = await abrir(page);
  await tresErros(page);
  await expect(page.locator('#submit')).toBeDisabled();
  await expect(page).not.toHaveURL(/success\.html/);
  expect(msgs.length).toBe(3);
});

test('CT11 - bloqueio deveria persistir ao recarregar', async ({ page }) => {
  await abrir(page);
  await tresErros(page);
  await page.reload();
  // Esperado correto: continuar bloqueado.
  await expect(page.locator('#username')).toBeDisabled();
});

test('CT12 - texto muito longo', async ({ page }) => {
  const msgs = await abrir(page);
  const longo = 'a'.repeat(500);
  await login(page, longo, longo);
  await expect(page).not.toHaveURL(/success\.html/);
  expect(msgs[0]).toContain('2 attempts left');
});

test('CT13 - maiúsculas e espaço no fim', async ({ page }) => {
  await abrir(page);
  await login(page, 'PATWAN', OK.pass);
  await expect(page).not.toHaveURL(/success\.html/);
  await login(page, 'Patwan ', OK.pass);
  await expect(page).not.toHaveURL(/success\.html/);
});

test('CT14 - caracteres especiais não executam código', async ({ page }) => {
  const msgs = await abrir(page);
  await login(page, '<script>alert(1)</script>', 'x');
  await login(page, "' OR '1'='1", "' OR '1'='1");
  await expect(page).not.toHaveURL(/success\.html/);
  // Todo alert deve ser só o de tentativas; um alert "1" indicaria XSS.
  for (const m of msgs) expect(m).toMatch(/attempts left/);
});

test('CT15 - acesso direto a success.html sem login', async ({ page }) => {
  await page.goto('/success.html');
  // Esperado correto: não mostrar a página de sucesso sem login.
  await expect(page.locator('h1')).not.toContainText('Congratulations');
});

test('CT16 (extra) - reativar campos após bloqueio não deveria logar', async ({ page }) => {
  await abrir(page);
  await tresErros(page);
  // Simula o usuário reativando os campos pelo DevTools
  await page.evaluate(() => {
    for (const id of ['username', 'password', 'submit']) {
      document.getElementById(id).disabled = false;
    }
  });
  await login(page, OK.user, OK.pass);
  await expect(page).not.toHaveURL(/success\.html/);
});