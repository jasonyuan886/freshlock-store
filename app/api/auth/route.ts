import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23lihgmCMClMp2C2Gx';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '61c419b750992597b83b169091208ba6ac4cbc3d';
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freshlocksealer.com';
const REDIRECT_URI = `${ORIGIN}/api/auth`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const provider = searchParams.get('provider');

  // Step 1: Initial request from CMS popup → redirect to GitHub OAuth
  if (!code && !error) {
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', CLIENT_ID);
    githubAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    githubAuthUrl.searchParams.set('scope', 'repo');
    githubAuthUrl.searchParams.set('response_type', 'code');
    return NextResponse.redirect(githubAuthUrl.toString(), 302);
  }

  // Step 2: User denied authorization
  if (error) {
    return new NextResponse(
      `<script>window.opener.postMessage(JSON.stringify({error:"${error}",provider:"github"}),"*");window.close();</script>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Step 3: Callback from GitHub with code → exchange for access token
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return new NextResponse(
        `<script>window.opener.postMessage(JSON.stringify({error:"${tokenData.error_description || tokenData.error || 'token_exchange_failed'}",provider:"github"}),"*");window.close();</script>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const token = tokenData.access_token;
    return new NextResponse(
      `<script>window.opener.postMessage(JSON.stringify({token:"${token}",provider:"github"}),"*");window.close();</script>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (e: any) {
    return new NextResponse(
      `<script>window.opener.postMessage(JSON.stringify({error:"server_error",provider:"github"}),"*");window.close();</script>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
