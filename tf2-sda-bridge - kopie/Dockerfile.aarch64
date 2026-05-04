ARG BUILD_ARCH=amd64
FROM ghcr.io/home-assistant/${BUILD_ARCH}-base:latest

ARG BUILD_VERSION=1.1.3
ARG BUILD_ARCH=amd64

LABEL io.hass.name="TF2 SDA Bridge" \
      io.hass.description="Embedded maFile Steam Guard helper for TF2 Trading Hub" \
      io.hass.version="${BUILD_VERSION}" \
      io.hass.type="app" \
      io.hass.arch="${BUILD_ARCH}" \
      org.opencontainers.image.source="https://github.com/DenyTwo918/TF2-HA"

RUN apk add --no-cache nodejs
WORKDIR /app
COPY dist ./dist
COPY public ./public
COPY package.json ./package.json
COPY config.yaml ./config.yaml
COPY run.sh /run.sh
RUN chmod +x /run.sh
EXPOSE 8098
CMD ["/run.sh"]
