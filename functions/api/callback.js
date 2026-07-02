function renderBody(status, content) {
	const html = `
		<script>
			const receiveMessage = (message) => {
				window.opener.postMessage(
					'authorization:github:${status}:${JSON.stringify(content)}',
					message.origin
				);
				window.removeEventListener('message', receiveMessage, false);
			};

			window.addEventListener('message', receiveMessage, false);
			window.opener.postMessage('authorizing:github', '*');
		</script>
	`;

	return html;
}

function getCookie(request, name) {
	const cookieHeader = request.headers.get('Cookie') ?? '';
	const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
	const cookie = cookies.find((item) => item.startsWith(`${name}=`));

	return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
}

function getEnvVar(context, name) {
	return context.env?.[name];
}

function missingEnvResponse(names, context) {
	const availableKeys = Object.keys(context.env ?? {}).sort();
	const detail = availableKeys.length
		? `Available context.env keys: ${availableKeys.join(', ')}.`
		: 'No context.env keys were available to this Pages Function.';
	const guidance =
		'This function is reading context.env. If other keys are listed, add these values to the same Pages project as Preview runtime secrets, not Production-only or build-only, then redeploy.';

	return new Response(`Missing GitHub OAuth environment variables: ${names.join(', ')}. ${detail} ${guidance}`, {
		headers: { 'content-type': 'text/plain;charset=UTF-8' },
		status: 500,
	});
}

export async function onRequest(context) {
	const { request } = context;
	const clientId = getEnvVar(context, 'GITHUB_CLIENT_ID');
	const clientSecret = getEnvVar(context, 'GITHUB_CLIENT_SECRET');

	if (!clientId || !clientSecret) {
		const missing = [
			!clientId && 'GITHUB_CLIENT_ID',
			!clientSecret && 'GITHUB_CLIENT_SECRET',
		].filter(Boolean);

		return missingEnvResponse(missing, context);
	}

	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');
		const expectedState = getCookie(request, 'decap_oauth_state');

		if (!code) {
			return new Response(renderBody('error', { error: 'Missing OAuth code.' }), {
				headers: { 'content-type': 'text/html;charset=UTF-8' },
				status: 400,
			});
		}

		if (!state || state !== expectedState) {
			return new Response(renderBody('error', { error: 'Invalid OAuth state.' }), {
				headers: { 'content-type': 'text/html;charset=UTF-8' },
				status: 400,
			});
		}

		const response = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'user-agent': 'hex-design-labs-decap-cloudflare-oauth',
				accept: 'application/json',
			},
			body: JSON.stringify({
				client_id: clientId,
				client_secret: clientSecret,
				code,
				redirect_uri: `${url.origin}/api/callback`,
			}),
		});

		const result = await response.json();

		if (result.error) {
			return new Response(renderBody('error', result), {
				headers: { 'content-type': 'text/html;charset=UTF-8' },
				status: 401,
			});
		}

		const successResponse = new Response(
			renderBody('success', {
				token: result.access_token,
				provider: 'github',
			}),
			{
				headers: { 'content-type': 'text/html;charset=UTF-8' },
				status: 200,
			}
		);

		successResponse.headers.append(
			'Set-Cookie',
			'decap_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0'
		);

		return successResponse;
	} catch (error) {
		console.error(error);

		return new Response(error.message, {
			headers: { 'content-type': 'text/plain;charset=UTF-8' },
			status: 500,
		});
	}
}
