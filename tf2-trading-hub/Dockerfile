ARG BUILD_ARCH=amd64
FROM ghcr.io/home-assistant/${BUILD_ARCH}-base:latest

ARG BUILD_VERSION=5.13.69
ARG BUILD_ARCH=amd64

LABEL io.hass.name="TF2 Trading Hub" \
      io.hass.description="TF2 trading bot for Home Assistant — trade review, backpack.tf listings, Steam integration." \
      io.hass.type="addon" \
      io.hass.version="${BUILD_VERSION}" \
      maintainer="DenyTwo918" \
      org.opencontainers.image.title="TF2 Trading Hub" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.source="https://github.com/DenyTwo918/TF2-HA"

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund

COPY dist ./dist
COPY public ./public
COPY config.yaml ./config.yaml
COPY run.sh /run.sh

RUN chmod +x /run.sh

EXPOSE 8099

CMD ["/run.sh"]
