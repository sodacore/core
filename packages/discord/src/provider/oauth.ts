import type { IConfig, ITokenResult } from '../types';
import { Logger } from '@sodacore/core';
import { Inject, Provide } from '@sodacore/di';

@Provide()
export default class OAuthProvider {
	@Inject('@discord:config') private config!: IConfig;
	@Inject() private logger!: Logger;
	private allowSso = false;
	private authoriseUrl = 'https://discord.com/oauth2/authorize';
	private tokenUrl = 'https://discord.com/api/oauth2/token';
	private userUrl = 'https://discord.com/api/users/@me';
	private customUrl = 'https://discord.com/api';

	public async onInit() {
		if (
			this.config.clientId
			&& this.config.clientSecret
			&& this.config.baseUrl
			&& this.config.scopes
		) {
			this.allowSso = true;
		}
	}

	public doAuthorisation(redirectUrl: string, state?: string) {
		if (!this.canUseSso()) throw new Error('Discord OAuth is not configured correctly.');
		return Response.redirect(this.getUrl(`${this.config.baseUrl ?? ''}${redirectUrl}`, state));
	}

	public async doAccept(query: URLSearchParams, redirectUrl: string, state?: string) {
		if (!this.canUseSso()) throw new Error('Discord OAuth is not configured correctly.');

		if (state && state !== query.get('state')) {
			this.logger.error(`[DISCORD:OAUTH]: Failed to accept authorisation: Invalid state parameter.`);
			return false;
		}

		if (query.get('error')) {
			this.logger.error(`[DISCORD:OAUTH]: Failed to accept authorisation: ${query.get('error')} (${query.get('error_description')})`);
			return false;
		}

		const payload = new URLSearchParams();
		payload.set('client_id', this.config.clientId || '');
		payload.set('client_secret', this.config.clientSecret || '');
		payload.set('scope', (this.config.scopes || []).join(' '));
		payload.set('grant_type', 'authorization_code');
		payload.set('code', query.get('code') || '');
		payload.set('redirect_uri', `${this.config.baseUrl ?? ''}${redirectUrl}`);

		const response = await fetch(this.tokenUrl, {
			method: 'POST',
			body: payload,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		if (!response.ok) {
			this.logger.error(`[DISCORD:OAUTH]: Failed to accept authorisation: ${response.statusText} (${response.status})`);
			return false;
		}

		const result: any = await response.json();
		return <ITokenResult>{
			tokenType: result.token_type,
			expiresIn: result.expires_in,
			refreshToken: result.refresh_token,
			accessToken: result.access_token,
			scope: result.scope,
		};
	}

	public async refreshToken(refreshToken: string) {
		if (!this.canUseSso()) throw new Error('Discord OAuth is not configured correctly.');

		const payload = new URLSearchParams();
		payload.set('client_id', this.config.clientId || '');
		payload.set('client_secret', this.config.clientSecret || '');
		payload.set('grant_type', 'refresh_token');
		payload.set('refresh_token', refreshToken);

		const response = await fetch(this.tokenUrl, {
			method: 'POST',
			body: payload,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		if (!response.ok) {
			this.logger.error(`[DISCORD:OAUTH]: Failed to refresh token: ${response.statusText} (${response.status})`);
			return null;
		}

		return await response.json() as ITokenResult;
	}

	public async getUser<T = Record<string, any>>(accessToken: string) {
		if (!this.canUseSso()) throw new Error('Discord OAuth is not configured correctly.');

		const response = await fetch(this.userUrl, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			this.logger.error(`[DISCORD:OAUTH]: Failed to get user: ${response.statusText} (${response.status})`);
			return null;
		}

		return await response.json() as T;
	}

	public async getCustom(apiPath: string, accessToken: string) {
		if (!this.canUseSso()) throw new Error('Discord OAuth is not configured correctly.');

		const response = await fetch(`${this.customUrl}/${apiPath}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			this.logger.error(`[DISCORD:OAUTH]: Failed to get custom API: ${response.statusText} (${response.status})`);
			return null;
		}

		return await response.json();
	}

	private canUseSso() {
		return this.allowSso;
	}

	private getUrl(redirectUri: string, state?: string) {

		// Define the params.
		const params = new URLSearchParams();
		params.set('client_id', this.config.clientId || '');
		params.set('response_type', 'code');
		params.set('redirect_uri', redirectUri);
		params.set('scope', (this.config.scopes || []).join(' '));
		params.set('prompt', 'consent');
		params.set('integration_type', '0');

		// If a state, set it.
		if (state) params.set('state', state);

		// Return the URL.
		return `${this.authoriseUrl}?${params.toString()}`;
	}
}
