function getEnvVar(context, name) {
	return context.env?.[name];
}

function missingEnvResponse(name, context) {
	const availableKeys = Object.keys(context.env ?? {}).sort();
	const detail = availableKeys.length
		? `Available context.env keys: ${availableKeys.join(', ')}.`
		: 'No context.env keys were available to this Pages Function.';
	const guidance =
		'This function is reading context.env. If other keys are listed, add this value to the same Pages project as a Preview runtime secret, not Production-only or build-only, then redeploy.';

	return new Response(`Missing ${name} environment variable. ${detail} ${guidance}`, {
		headers: { 'content-type': 'text/plain;charset=UTF-8' },
		status: 500,
	});
}

export async function onRequest(context) {
	const { request } = context;
	const clientId = getEnvVar(context, 'GITHUB_CLIENT_ID');
	const configuredRedirectUri = getEnvVar(context, 'GITHUB_REDIRECT_URI');

	if (!clientId) {
		return missingEnvResponse('GITHUB_CLIENT_ID', context);
	}

	const url = new URL(request.url);
	const redirectUri = configuredRedirectUri || `${url.origin}/api/callback`;
	const state = crypto.randomUUID();
	const redirectUrl = new URL('https://github.com/login/oauth/authorize');
	redirectUrl.searchParams.set('client_id', clientId);
	redirectUrl.searchParams.set('redirect_uri', redirectUri);
	redirectUrl.searchParams.set('scope', 'repo user');
	redirectUrl.searchParams.set('state', state);
	const stateCookie = `decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`;

	return new Response(null, {
		status: 302,
		headers: {
			Location: redirectUrl.href,
			'Set-Cookie': stateCookie,
		},
	});
}
